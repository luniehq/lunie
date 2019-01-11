import transactionsModule from "renderer/vuex/modules/transactions.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

const mockRootState = {
  connection: {
    connected: true
  },
  user: {
    address: `default`
  }
}

describe(`Module: Transactions`, () => {
  let module, state, actions, mutations, node

  beforeEach(async () => {
    node = {}
    module = transactionsModule({ node })
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  it(`should have an empty state by default`, () => {
    expect(state).toMatchSnapshot()
  })

  it(`should update transaction times`, () => {
    state.wallet.push({
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
    expect(state.wallet.find(tx => tx.height === `3436`).time).toBe(1042)
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
    expect(state.wallet).toHaveLength(0)
    expect(state.staking).toHaveLength(0)
  })

  it(`should load and enrich txs`, async () => {
    const dispatch = jest
      .fn()
      .mockImplementationOnce(() => lcdClientMock.state.txs.slice(4))
      .mockImplementationOnce(() => lcdClientMock.state.txs.slice(2, 4))
      .mockImplementationOnce(() => lcdClientMock.state.txs.slice(0, 2))
    const commit = jest.fn()
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
    expect(commit).toHaveBeenCalledWith(
      `setStakingTxs`,
      lcdClientMock.state.txs.slice(4)
    )
    expect(commit).toHaveBeenCalledWith(
      `setGovernanceTxs`,
      lcdClientMock.state.txs.slice(2, 4)
    )
    expect(commit).toHaveBeenCalledWith(
      `setWalletTxs`,
      lcdClientMock.state.txs.slice(0, 2)
    )
  })

  it(`should fail if trying to get transactions of wrong type`, () => {
    expect(
      actions.getTx({ rootState: mockRootState }, `unknown`)
    ).rejects.toThrowError(new Error(`Unknown transaction type`))
  })

  it.only(`should query the txs on reconnection`, async () => {
    const dispatch = jest.fn()
    await actions.reconnected({ state: { loading: true }, dispatch })
    expect(dispatch).toHaveBeenCalledWith(`getAllTxs`)
  })

  it(`should not query the txs on reconnection if not stuck in loading`, async () => {
    const dispatch = jest.fn()
    await actions.reconnected({ state: { loading: false }, dispatch })
    expect(dispatch).not.toHaveBeenCalledWith(`getAllTxs`)
  })

  it(`should set error to true if enriching transactions fail`, async () => {
    let error = new Error(`unexpected error`)
    let { actions, state } = module

    const commit = jest.fn()
    const dispatch = jest.fn(() => {
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
})
