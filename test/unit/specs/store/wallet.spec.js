import walletModule from "modules/wallet.js"

const mockRootState = {
  config: { bondingDenom: `STAKE` },
  connection: {
    connected: true
  }
}

describe(`Module: Wallet`, () => {
  let module

  beforeEach(() => {
    module = walletModule({ node: {} })
  })

  // DEFAULT

  it(`should have an empty state by default`, () => {
    let { state } = module
    expect(state).toMatchSnapshot()
  })

  // MUTATIONS

  it(`should set wallet balances `, () => {
    let { state, mutations } = module
    const balances = [{ denom: `leetcoin`, amount: `1337` }]
    mutations.setWalletBalances(state, balances)
    expect(state.balances).toBe(balances)
  })

  it(`should set wallet key and clear balance `, () => {
    let { state, mutations } = module
    const address = `tb1v9jxgun9wdenzv3nu98g8r`
    mutations.setWalletAddress(state, address)
    expect(state.address).toBe(address)
    expect(state.balances).toEqual([])
  })

  it(`should set denoms`, () => {
    let { state, mutations } = module
    const denoms = [`acoin`, `bcoin`, `ccoin`]
    mutations.setDenoms(state, denoms)
    expect(state.denoms).toBe(denoms)
  })

  // ACTIONS

  it(`should initialize wallet`, async () => {
    let { state, actions } = module
    const address = `tb1mjt6dcdru8lgdz64h2fu0lrzvd5zv8sfcvkv2l`
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.initializeWallet({ commit, dispatch }, address)
    expect(state.address).toEqual(address)
  })

  it(`should query wallet balances`, async () => {
    const coins = [
      {
        denom: `fermion`,
        amount: 42
      }
    ]
    module = walletModule({
      node: {
        queryAccount: () =>
          Promise.resolve({
            coins,
            sequence: `1`,
            account_number: `2`
          })
      }
    })
    const { state, actions } = module
    const commit = jest.fn()
    await actions.queryWalletBalances({
      state,
      rootState: mockRootState,
      commit
    })
    expect(commit).toHaveBeenCalledWith([
      [`setNonce`, `1`],
      [`setAccountNumber`, `2`],
      [`setWalletBalances`, coins]
    ])
  })

  it(`should load denoms`, async () => {
    jest.resetModules()
    jest.doMock(`fs-extra`, () => ({
      pathExists: () => Promise.resolve(true),
      readJson: () =>
        Promise.resolve({
          app_state: {
            accounts: [
              {
                coins: [
                  {
                    denom: `mycoin`
                  },
                  {
                    denom: `fermion`
                  }
                ]
              }
            ]
          }
        })
    }))
    let { actions } = walletModule({})
    let commit = jest.fn()
    await actions.loadDenoms({ commit, rootState: mockRootState })
    expect(commit).toHaveBeenCalledWith(`setDenoms`, [`mycoin`, `fermion`])
  })

  it(`should throw an error if can't load genesis`, async () => {
    jest.resetModules()
    jest.spyOn(console, `error`).mockImplementationOnce(() => {})
    jest.doMock(`fs-extra`, () => ({
      pathExists: () => Promise.reject(`didn't found`)
    }))
    let { actions, state } = walletModule({})
    let commit = jest.fn()
    await actions.loadDenoms({ commit, state, rootState: mockRootState }, 2)
    expect(state.error).toMatchSnapshot()
  })

  it(`should query the balances on reconnection`, () => {
    store.state.connection.stopConnecting = true
    store.state.wallet.loading = true
    store.state.wallet.address = `12345678901234567890`
    jest.spyOn(node, `queryAccount`)
    store.dispatch(`reconnected`)
    expect(node.queryAccount).toHaveBeenCalled()
  })

  it(`should not query the balances on reconnection if not stuck in loading`, () => {
    store.state.connection.stopConnecting = true
    store.state.wallet.loading = false
    jest.spyOn(node, `queryAccount`)
    store.dispatch(`reconnected`)
    expect(node.queryAccount).not.toHaveBeenCalled()
  })

  it(`should be in loading state before querying account, and not in loading state after`, async () => {
    node.queryAccount = () =>
      Promise.resolve({
        coins: [
          {
            denom: `fermion`,
            amount: 42
          }
        ]
      })

    expect(store.state.wallet.loading).toBe(true)
    await store.dispatch(`initializeWallet`, `tb1wdhk6e2pv3j8yetnwv0yr6s6`)
    expect(store.state.wallet.loading).toBe(false)
  })

  it(`should query wallet data at specified height`, async done => {
    jest.useFakeTimers()
    let height = store.state.connection.lastHeader.height
    await store
      .dispatch(`queryWalletStateAfterHeight`, height + 1)
      .then(() => done())
    store.state.connection.lastHeader.height++
    jest.runAllTimers()
    jest.useRealTimers()
  })

  it(`should not error when subscribing with no address`, async () => {
    store.state.wallet.address = null
    store.state.wallet.decodedAddress = null
    await store.dispatch(`walletSubscribe`)
  })

  it(`should handle subscription errors`, async () => {
    store.state.wallet.address = `x`
    store.state.wallet.decodedAddress = `x`

    jest
      .spyOn(console, `error`)
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {})
    node.rpc.subscribe = jest.fn(({}, cb) => {
      //query is param
      cb(Error(`foo`))
    })

    await store.dispatch(`walletSubscribe`)
  })

  it(`should query wallet on subscription txs`, async () => {
    store.state.wallet.address = `x`
    store.state.wallet.decodedAddress = `x`

    await new Promise(async resolve => {
      node.queryAccount = jest.fn(() => {
        if (node.queryAccount.mock.calls.length < 2) return
        resolve()
      })

      node.rpc.subscribe = jest.fn(({}, cb) => {
        // query is param
        cb(null, { data: { value: { TxResult: { height: -1 } } } })
      })

      await store.dispatch(`walletSubscribe`)
    })
  })

  it(`should backup to polling balances for now`, async () => {
    jest.useFakeTimers()
    store.state.wallet.address = `x`
    store.state.wallet.decodedAddress = `x`

    await new Promise(async resolve => {
      node.queryAccount = jest.fn(() => {
        if (node.queryAccount.mock.calls.length < 2) return
        resolve()
      })

      await store.dispatch(`walletSubscribe`)
      jest.runAllTimers()
    })
  })

  it(`should store an error if failed to load balances`, async () => {
    store.state.wallet.address = `x`
    jest
      .spyOn(node, `queryAccount`)
      .mockImplementationOnce(() => Promise.reject(new Error(`Error`)))
    await store.dispatch(`queryWalletBalances`)
    expect(store.state.wallet.error.message).toBe(`Error`)
  })
})
