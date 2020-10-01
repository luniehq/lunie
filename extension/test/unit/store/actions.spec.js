import actions from 'store/actions'

let mockApollo = {
  async query() {}
}

let store = {
  dispatch: jest.fn(),
  getters: {
    networks: [
      {
        id: `localnet`,
        address_prefix: 'lcl',
        network_type: 'cosmos',
        coinLookup: [{
          chainDenom: 'uatom',
          viewDenom: 'ATOM',
        }]
      }
    ]
  }
}
const {
  createKey,
  getAddressFromSeed,
  loadLocalAccounts,
  testLogin,
  getSignRequest,
  approveSignRequest,
  rejectSignRequest,
  getValidatorsData,
} = actions({
  apollo: mockApollo
})

describe('actions', () => {
  beforeEach(() => {
    window.chrome = {
      runtime: {
        sendMessage: jest.fn((args, callback) => {
          callback()
        })
      }
    }
  })

  xit('Recover Seed', async () => {
    const recoverAddressBundle = {
      seedPhrase:
        'tail license inside galaxy emerge guess celery tide hobby medal horse swear whale giraffe master shed sheriff fossil whisper fiscal upgrade such erosion entry',
      network: 'localnet'
    }
    const recoveredAddress = await getAddressFromSeed(
      store,
      recoverAddressBundle
    )
    expect(recoveredAddress).toEqual(
      'lcl1p8dz4sfnj7z4f6g2kg8lfhv9hkmftgx8qmzhmx'
    )
  })

  xit('Create key from existing seed', async () => {
    await createKey(store, {
      seedPhrase: 'seed words',
      password: '1234567890',
      name: 'TEST',
      network: 'localnet'
    })
    expect(store.dispatch).toHaveBeenCalledWith('loadLocalAccounts')
  })

  it('Request wallets from extension', async () => {
    const commit = jest.fn()
    loadLocalAccounts({ commit })
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: 'GET_WALLETS' },
      expect.any(Function)
    )
  })

  it('Test Login', () => {
    window.chrome.runtime.sendMessage
      .mockImplementationOnce((args, callback) => callback(true))
      .mockImplementationOnce((args, callback) => callback(false))
    expect(
      testLogin(null, { address: 'cosmos1234', password: '1234567890' })
    ).resolves.toBe(true)
    expect(
      testLogin(null, { address: 'cosmos1234', password: '1234567890' })
    ).resolves.toBe(false)
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'TEST_PASSWORD',
        payload: { address: 'cosmos1234', password: '1234567890' }
      },
      expect.any(Function)
    )
  })

  it('Get Sign Request', () => {
    const signRequest = {
      signMessage: '',
      id: 12345,
      senderAddress: 'cosmos1234',
      tabId: 123,
      network: 'localnet',
    }
    const commit = jest.fn()
    window.chrome.runtime.sendMessage.mockImplementationOnce((args, callback) =>
      callback(signRequest)
    )
    expect(getSignRequest({ commit })).resolves.toEqual(signRequest)
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'GET_SIGN_REQUEST'
      },
      expect.any(Function)
    )
    expect(commit).toHaveBeenCalledWith('setSignRequest', signRequest)
  })

  it('Approve Sign Request', async () => {
    const signRequest = {
      id: 12345,
      message: '',
      messageType: 'SendTx',
      senderAddress: 'cosmos1234',
      transactionData: {
        message: '',
        senderAddress: 'cosmos1234',
        fee: []
      },
      tabId: 123,
      network: 'localnet',
      HDPath: `m/44'/118'/0'/0/0`,
      curve: 'ed25519'
    }
    const getters = {
      networks: [
        {
          id: `localnet`,
          address_prefix: 'lcl',
          network_type: 'cosmos',
          coinLookup: [{
            chainDenom: 'uatom',
            viewDenom: 'ATOM',
          }],
        }
      ]
    }
    const commit = jest.fn()
    window.chrome.runtime.sendMessage.mockImplementationOnce((args, callback) =>
      callback('hi')
    )
    await approveSignRequest(
      { commit, getters },
      { ...signRequest, password: '1234567890' }
    )
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'SIGN',
        payload: {
          message: '',
          messageType: 'SendTx',
          transactionData: {
            message: '',
            senderAddress: 'cosmos1234',
            fee: []
          },
          senderAddress: 'cosmos1234',
          password: '1234567890',
          id: 12345,
          HDPath: `m/44'/118'/0'/0/0`,
          curve: 'ed25519',
          network: {
            id: 'localnet',
            network_type: 'cosmos',
            address_prefix: 'lcl',
            coinLookup: [
              {
                chainDenom: 'uatom',
                viewDenom: 'ATOM'
              }
            ],
          }
        }
      },
      expect.any(Function)
    )
    expect(commit).toHaveBeenCalledWith('setSignRequest', null)
  })

  it('Approve Sign Request Fail', async () => {
    const signRequest = {
      signMessage: '',
      id: 12345,
      senderAddress: 'cosmos1234',
      tabId: 123,
      network: 'localnet',
    }
    const getters = {
      networks: [
        {
          id: `localnet`,
          address_prefix: 'lcl',
          network_type: 'cosmos'
        }
      ]
    }
    const commit = jest.fn()
    window.chrome.runtime.sendMessage.mockImplementationOnce((args, callback) =>
      callback({ error: 'fail' })
    )
    await expect(
      approveSignRequest(
        { commit, getters },
        { ...signRequest, password: '1234567890' }
      )
    ).rejects.toBe('fail')
  })

  it('Reject Sign Request', async () => {
    const signRequest = {
      signMessage: '',
      id: 12345,
      senderAddress: 'cosmos1234',
      tabId: 123,
      network: 'localnet',
    }
    const commit = jest.fn()
    window.chrome.runtime.sendMessage.mockImplementationOnce((args, callback) =>
      callback()
    )
    await rejectSignRequest({ commit }, { ...signRequest })
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'REJECT_SIGN_REQUEST',
        payload: signRequest
      },
      expect.any(Function)
    )
    expect(commit).toHaveBeenCalledWith('setSignRequest', null)
  })

  it('Get Validators Name with incorrect message type', async () => {
    const validatorAddress = {
      value: {
        msg: [
          {
            type: 'WRONG',
            value: {
              validator_src_address: 'srcaddress1',
              validator_dst_address: 'dstaddress1'
            }
          }
        ]
      }
    }

    await expect(getValidatorsData(validatorAddress)).resolves.toEqual([])
  })
})
