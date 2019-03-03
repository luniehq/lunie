import transactionsModule from "renderer/vuex/modules/transactions.js"
import txs from "./json/txs"

const address = `cosmos1address`
let dispatch = jest.fn()
const commit = jest.fn()
const mockRootState = {
  connection: {
    connected: true
  },
  session: {
    address,
    signedIn: true
  }
}

describe(`Module: Transactions`, () => {
  let module, state, actions, mutations, node

  beforeEach(async () => {
    node = {
      txs: () => Promise.resolve([{ txhash: 2 }]),
      getStakingTxs: () => Promise.resolve([{ txhash: 1 }]),
      getGovernanceTxs: () => Promise.resolve([{ txhash: 3 }, { txhash: 3 }]),
      getDistributionTxs: () => Promise.resolve([{ txhash: 4 }]),
    }
    module = transactionsModule({ node })
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  it(`should have an empty state by default`, () => {
    expect(state).toMatchSnapshot()
  })

  it(`should update transaction times`, () => {
    state.bank.push({
      height: `3436`
    })
    // enrich one wallet tx
    mutations.setTransactionTime(state, {
      blockHeight: `3436`,
      blockMetaInfo: {
        header: {
          time: 42000
        }
      }
    })
    expect(state.wallet.find(tx => tx.height === `3436`).time).toBe(42000)
  })

  it(`should clear session data`, () => {
    actions.resetSessionData({
      rootState: {
        transactions: {
          wallet: [{}],
          staking: [{}]
        }
      }
    })
    expect(state.bank).toHaveLength(0)
    expect(state.staking).toHaveLength(0)
  })

  it(`should load and enrich txs`, async () => {
    dispatch = dispatch
      .mockImplementationOnce(() => txs.slice(4))
      .mockImplementationOnce(() => txs.slice(2, 4))
      .mockImplementationOnce(() => txs.slice(0, 2))
    await actions.getAllTxs({
      commit,
      dispatch,
      state,
      rootState: mockRootState
    })
    expect(dispatch).toHaveBeenCalledWith(
      `enrichTransactions`,
      expect.arrayContaining([])
    )
    expect(commit).toHaveBeenCalledWith(`setStakingTxs`, txs.slice(4))
    expect(commit).toHaveBeenCalledWith(`setGovernanceTxs`, txs.slice(2, 4))
    expect(commit).toHaveBeenCalledWith(`setWalletTxs`, txs.slice(0, 2))
  })

  it(`should fail if trying to get transactions of wrong type`, () => {
    expect(
      actions.getTx({ rootState: mockRootState }, `unknown`)
    ).rejects.toThrowError(new Error(`Unknown transaction type`))
  })

  describe(`queries the txs on reconnection`, () => {
    it(`when the user has logged in and is loading`, async () => {
      await actions.reconnected({
        state: { loading: true },
        dispatch,
        rootState: { session: { signedIn: true } }
      })
      expect(dispatch).toHaveBeenCalledWith(`getAllTxs`)
    })

    it(`fails if txs are not loading`, async () => {
      await actions.reconnected({
        state: { loading: false },
        dispatch,
        rootState: { session: { signedIn: true } }
      })
      expect(dispatch).not.toHaveBeenCalledWith(`getAllTxs`)
    })

    it(`fails if the user hasn't logged in`, async () => {
      await actions.reconnected({
        state: { loading: true },
        dispatch,
        rootState: { session: { signedIn: false } }
      })
      expect(dispatch).not.toHaveBeenCalledWith(`getAllTxs`)
    })
  })

  it(`should set error to true if enriching transactions fail`, async () => {
    const error = new Error(`unexpected error`)
    const { actions, state } = module
    dispatch = jest.fn(() => {
      throw error
    })
    await actions.getAllTxs({
      commit,
      dispatch,
      state,
      rootState: mockRootState
    })

    expect(state.error).toBe(error)
  })

  describe(`mutations`, () => {
    it(`should set bank transactions `, () => {
      const transactions = txs.slice(0, 2)
      mutations.seBankTxs(state, transactions)
      expect(state.bank).toBe(transactions)
    })

    it(`should set staking transactions `, () => {
      const transactions = txs.slice(2)
      mutations.setStakingTxs(state, transactions)
      expect(state.staking).toBe(transactions)
    })

    it(`should set governance transactions `, () => {
      const transactions = txs.slice(2, 4)
      mutations.setGovernanceTxs(state, transactions)
      expect(state.governance).toBe(transactions)
    })

    it(`should set distribution transactions `, () => {
      const transactions = txs.slice(2, 4)
      mutations.setDistributionTxs(state, transactions)
      expect(state.distribution).toBe(transactions)
    })

    it(`should set history loading`, () => {
      mutations.setHistoryLoading(state, false)
      expect(state.loading).toEqual(false)
    })

    it(`should set denoms`, () => {
      const { state, mutations } = module
      state.staking = [{ height: 150 }]
      mutations.setTransactionTime(state, {
        blockHeight: 150,
        blockMetaInfo: { header: { time: 123 } }
      })
      expect(state.staking).toEqual([{ height: 150, time: 123 }])
    })
  })

  describe(`getTx`, () => {
    it(`should fetch staking txs`, async () => {
      const staking = await actions.getTx(
        { rootState: { session: { address } } },
        `staking`
      )
      expect(staking).toEqual([{ txhash: 1, type: `staking` }])
    })

    it(`should fetch governance txs`, async () => {
      const governance = await actions.getTx(
        { rootState: { session: { address } } },
        `governance`
      )
      expect(governance).toEqual([{ txhash: 3, type: `governance` }])
    })

    it(`should fetch bank txs`, async () => {
      const bank = await actions.getTx(
        { rootState: { session: { address } } },
        `bank`
      )
      expect(bank).toEqual([{ txhash: 2, type: `bank` }])
    })

    it(`should fetch distribution txs`, async () => {
      const distribution = await actions.getTx(
        { rootState: { session: { address } } },
        `distribution`
      )
      expect(distribution).toEqual([{ txhash: 4, type: `distribution` }])
    })

    it(`should throw error`, async () => {
      await expect(() => actions.getTx(
        { rootState: { session: { address } } },
        `zero-knowledge`)).rejects.toThrowError(`Unknown transaction type`)
    })
  })

  it(`should enrichTransactions`, async () => {
    await actions.enrichTransactions(
      { dispatch },
      { transactions: [{ height: 1 }, { height: 2 }] }
    )
    expect(dispatch).toHaveBeenCalledWith(`queryTransactionTime`, {
      blockHeight: 1
    })
    expect(dispatch).toHaveBeenCalledWith(`queryTransactionTime`, {
      blockHeight: 2
    })
  })
})
