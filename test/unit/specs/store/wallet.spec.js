import walletModule from "modules/wallet.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
let { stakingParameters } = lcdClientMock.state

const mockRootState = {
  stakingParameters,
  connection: {
    connected: true
  }
}
jest.mock(`src/network.js`, () => () => ({
  genesis: {
    app_state: {
      accounts: [
        {
          address: `cosmos1qwtatamg8nznvfy9a6nrt0qkdk328qsxexsj5q`,
          coins: [
            {
              denom: `mycoin`,
              amount: `1000`
            },
            {
              denom: `fermion`,
              amount: `2300`
            },
            {
              denom: `STAKE`,
              amount: `1000`
            }
          ],
          sequence_number: `1`,
          account_number: `49`
        }
      ]
    }
  }
}))

describe(`Module: Wallet`, () => {
  let module, actions, state

  beforeEach(() => {
    module = walletModule({ node: {} })
    state = module.state
    actions = module.actions
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

  it(`update individual wallet balances`, () => {
    let { state, mutations } = module

    state.balances.push({ denom: `coin`, amount: `42` })

    // add new
    const balance = { denom: `leetcoin`, amount: `1337` }
    mutations.updateWalletBalance(state, balance)
    expect(state.balances).toContain(balance)

    // update balance
    const updatedBalance = { denom: `leetcoin`, amount: `1` }
    mutations.updateWalletBalance(state, updatedBalance)
    expect(state.balances).toContain(updatedBalance)
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
    const { actions } = module

    const address = `tb1wdhk6e2pv3j8yetnwv0yr6s6`
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.initializeWallet({ commit, dispatch }, address)
    expect(commit).toHaveBeenCalledWith(`setWalletAddress`, address)
    expect(dispatch.mock.calls).toEqual([
      [`queryWalletBalances`],
      [`loadDenoms`],
      [`walletSubscribe`]
    ])
  })

  it(`should query wallet balances`, async () => {
    const coins = [
      {
        denom: `fermion`,
        amount: 42
      }
    ]
    const node = {
      queryAccount: jest.fn(() =>
        Promise.resolve({
          coins,
          sequence: `1`,
          account_number: `2`
        })
      )
    }
    module = walletModule({
      node
    })
    const { state, actions } = module
    const commit = jest.fn()
    state.address = `abc`
    await actions.queryWalletBalances({
      state,
      rootState: mockRootState,
      commit
    })
    expect(commit.mock.calls).toEqual([
      [`setNonce`, `1`],
      [`setAccountNumber`, `2`],
      [`setWalletBalances`, coins]
    ])
    expect(node.queryAccount).toHaveBeenCalled()
  })

  it(`should load denoms`, async () => {
    let commit = jest.fn()
    await actions.loadDenoms({ commit, rootState: mockRootState })
    expect(commit).toHaveBeenCalledWith(`setDenoms`, [
      `mycoin`,
      `fermion`,
      `STAKE`
    ])
  })

  it(`should throw an error if can't load genesis`, async () => {
    jest.resetModules()
    const mockPromise = Promise
    jest.mock(`src/network.js`, () => () => mockPromise.reject(`Error`))
    // needs to reload the file to import mocked module
    let walletModule = require(`modules/wallet.js`).default
    let { actions, state } = walletModule({})
    let commit = jest.fn()
    await actions.loadDenoms({ commit, state })
    expect(state.error).toMatchSnapshot()
  })

  it(`should query the balances on reconnection`, async () => {
    const { actions } = module
    const dispatch = jest.fn()
    await actions.reconnected({
      state: {
        loading: true,
        address: `abc`
      },
      dispatch
    })
    expect(dispatch).toHaveBeenCalledWith(`queryWalletBalances`)
  })

  it(`should not query the balances on reconnection if not stuck in loading`, async () => {
    const { actions } = module
    const dispatch = jest.fn()
    await actions.reconnected({
      state: {
        loading: false,
        address: `abc`
      },
      dispatch
    })
    expect(dispatch).not.toHaveBeenCalledWith(`queryWalletBalances`)
  })

  it(`should query wallet data at specified height`, async done => {
    const { actions } = module

    jest.useFakeTimers()
    let rootState = {
      connection: {
        lastHeader: {
          height: 10
        }
      }
    }
    const dispatch = jest.fn()
    actions
      .queryWalletStateAfterHeight({ rootState, dispatch }, 11)
      .then(() => done())
    rootState.connection.lastHeader.height++
    jest.runAllTimers()
    jest.useRealTimers()
  })

  it(`should not error when subscribing with no address`, async () => {
    const { actions, state } = module
    const dispatch = jest.fn()
    state.address = null
    state.decodedAddress = null
    await actions.walletSubscribe({ state, dispatch })
  })

  it(`should query wallet on subscription txs`, async () => {
    jest.useFakeTimers()

    const node = {
      rpc: {
        subscribe: jest.fn(({}, cb) => {
          //query is param
          cb({ TxResult: { height: -1 } })
        })
      }
    }
    const { actions, state } = walletModule({
      node
    })
    const dispatch = jest.fn()
    state.address = `x`

    await actions.walletSubscribe({ state, dispatch })

    jest.runTimersToTime(30000)
    expect(dispatch).toHaveBeenCalledTimes(6)
  })

  it(`should store an error if failed to load balances`, async () => {
    const node = {
      queryAccount: jest.fn(() => Promise.reject(new Error(`Error`)))
    }
    const { state, actions } = walletModule({
      node
    })
    const commit = jest.fn()
    state.address = `x`
    jest
      .spyOn(node, `queryAccount`)
      .mockImplementationOnce(() => Promise.reject(new Error(`Error`)))
    await actions.queryWalletBalances({
      state,
      rootState: mockRootState,
      commit
    })
    expect(state.error.message).toBe(`Error`)
  })

  it(`should send coins`, async () => {
    state.balances = [
      {
        denom: `funcoin`,
        amount: 1000
      }
    ]

    const dispatch = jest.fn()
    const commit = jest.fn()
    await actions.sendCoins(
      {
        state,
        rootState: mockRootState,
        dispatch,
        commit
      },
      {
        receiver: `cosmos1xxx`,
        amount: 12,
        denom: `funcoin`,
        password: `1234567890`
      }
    )

    expect(dispatch).toHaveBeenCalledWith(`sendTx`, {
      type: `send`,
      password: `1234567890`,
      to: `cosmos1xxx`,
      amount: [{ denom: `funcoin`, amount: `12` }]
    })

    // should update the balance optimistically
    expect(commit).toHaveBeenCalledWith(`updateWalletBalance`, {
      denom: `funcoin`,
      amount: 988
    })
  })
})
