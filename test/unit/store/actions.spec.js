import {
  createSeed,
  createKey,
  loadAccounts,
  testLogin,
  getSignRequest,
  approveSignRequest,
  rejectSignRequest,
  getValidatorsData
} from 'store/actions'

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

  it('createSeed', async () => {
    // eslint-disable-next-line standard/no-callback-literal
    window.chrome.runtime.sendMessage.mockImplementation((args, callback) =>
      callback('seed words')
    )
    expect(createSeed()).resolves.toBe('seed words')
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: 'GET_SEED' },
      expect.any(Function)
    )
  })

  it('createKey', async () => {
    const dispatch = jest.fn()
    window.chrome.runtime.sendMessage.mockImplementation((args, callback) =>
      callback()
    )
    await createKey(
      { dispatch },
      { seedPhrase: 'seed words', password: '1234567890', name: 'TEST' }
    )
    expect(dispatch).toHaveBeenCalledWith('loadAccounts')
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'IMPORT_WALLET',
        payload: {
          password: '1234567890',
          name: 'TEST',
          mnemonic: 'seed words'
        }
      },
      expect.any(Function)
    )
  })

  it('loadAccounts', async () => {
    const commit = jest.fn()
    loadAccounts({ commit })
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: 'GET_WALLETS' },
      expect.any(Function)
    )
  })

  it('testLogin', () => {
    // eslint-disable-next-line standard/no-callback-literal
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

  it('getSignRequest', () => {
    const signRequest = {
      signMessage: '',
      id: 12345,
      senderAddress: 'cosmos1234',
      tabId: 123
    }
    const commit = jest.fn()
    // eslint-disable-next-line standard/no-callback-literal
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

  it('approveSignRequest', async () => {
    const signRequest = {
      signMessage: '',
      id: 12345,
      senderAddress: 'cosmos1234',
      tabId: 123
    }
    const commit = jest.fn()
    // eslint-disable-next-line standard/no-callback-literal
    window.chrome.runtime.sendMessage.mockImplementationOnce((args, callback) =>
      callback()
    )
    await approveSignRequest(
      { commit },
      { ...signRequest, password: '1234567890' }
    )
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'SIGN',
        payload: {
          signMessage: '',
          senderAddress: 'cosmos1234',
          password: '1234567890',
          id: 12345
        }
      },
      expect.any(Function)
    )
    expect(commit).toHaveBeenCalledWith('setSignRequest', null)
  })

  it('approveSignRequest Fail', async () => {
    const signRequest = {
      signMessage: '',
      id: 12345,
      senderAddress: 'cosmos1234',
      tabId: 123
    }
    const commit = jest.fn()
    window.chrome.runtime.sendMessage.mockImplementationOnce((args, callback) =>
      callback({ error: 'fail' })
    )
    await expect(
      approveSignRequest({ commit }, { ...signRequest, password: '1234567890' })
    ).rejects.toBe('fail')
  })

  it('rejectSignRequest', async () => {
    const signRequest = {
      signMessage: '',
      id: 12345,
      senderAddress: 'cosmos1234',
      tabId: 123
    }
    const commit = jest.fn()
    // eslint-disable-next-line standard/no-callback-literal
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

  it('getValidatorsData Un/Delegate', async () => {
    const mockSuccessResponse = { description: { moniker: 'name1' } }
    const mockJsonPromise = Promise.resolve(mockSuccessResponse)
    const mockFetchPromise = Promise.resolve({
      json: () => mockJsonPromise
    })
    window.fetch = jest.fn(() => mockFetchPromise)

    const v1 = {
      value: {
        msg: [
          {
            type: 'cosmos-sdk/MsgDelegate',
            value: {
              validator_address: 'address1'
            }
          }
        ]
      }
    }

    await expect(getValidatorsData(v1)).resolves.toEqual([
      { description: { moniker: 'name1' }, operator_address: 'address1' }
    ])
  })

  it('getValidatorsData Redelegate', async () => {
    const mockFetchPromise = Promise.resolve({
      json: () => Promise.resolve({ description: { moniker: 'src' } })
    })

    const mockFetchPromise2 = Promise.resolve({
      json: () => Promise.resolve({ description: { moniker: 'dst' } })
    })

    window.fetch = jest
      .fn()
      .mockImplementationOnce(() => mockFetchPromise)
      .mockImplementationOnce(() => mockFetchPromise2)

    const validatorAddress = {
      value: {
        msg: [
          {
            type: 'cosmos-sdk/MsgBeginRedelegate',
            value: {
              validator_src_address: 'srcaddress1',
              validator_dst_address: 'dstaddress1'
            }
          }
        ]
      }
    }

    await expect(getValidatorsData(validatorAddress)).resolves.toEqual([
      { operator_address: 'srcaddress1', description: { moniker: 'src' } },
      { operator_address: 'dstaddress1', description: { moniker: 'dst' } }
    ])
  })

  it('getValidatorsData Wrong message type', async () => {
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
