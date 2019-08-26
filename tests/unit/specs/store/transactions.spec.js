import transactionsModule from "src/vuex/modules/transactions.js"
import { bankTxs } from "./json/txs"

describe(`Module: Transactions`, () => {
  let module, state, actions, mutations, node
  const address = `cosmos1address`
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

  beforeEach(async () => {
    node = {
      get: {
        txs: () => Promise.resolve([{ txhash: 2 }])
      }
    }
    module = transactionsModule({ node })
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  it(`should have an empty state by default`, () => {
    expect(state).toMatchSnapshot()
  })

  describe(`Mutations`, () => {
    it(`should set transactions `, () => {
      mutations.setTxs(state, bankTxs)
      expect(state.txs).toEqual(bankTxs)
    })

    it(`should set history loading`, () => {
      mutations.setHistoryLoading(state, false)
      expect(state.loading).toEqual(false)
    })
  })

  describe(`Actions`, () => {
    describe(`resetSessionData`, () => {
      it(`should clear session data`, () => {
        actions.resetSessionData({
          rootState: {
            transactions: {
              txs: [{}]
            }
          }
        })
        expect(state.txs).toHaveLength(0)
      })
    })

    describe(`reconnected`, () => {
      it(`when the user has logged in and is loading`, async () => {
        const dispatch = jest.fn()
        await actions.reconnected({
          state: { loading: true },
          dispatch,
          rootState: { session: { signedIn: true } }
        })
        expect(dispatch).toHaveBeenCalledWith(`getAllTxs`)
      })

      it(`fails if txs are not loading`, async () => {
        const dispatch = jest.fn()
        await actions.reconnected({
          state: { loading: false },
          dispatch,
          rootState: { session: { signedIn: true } }
        })
        expect(dispatch).not.toHaveBeenCalledWith(`getAllTxs`)
      })

      it(`fails if the user hasn't logged in`, async () => {
        const dispatch = jest.fn()
        await actions.reconnected({
          state: { loading: true },
          dispatch,
          rootState: { session: { signedIn: false } }
        })
        expect(dispatch).not.toHaveBeenCalledWith(`getAllTxs`)
      })
    })

    describe(`getAllTxs`, () => {
      it(`should get all types of txs`, async () => {
        node.get.txs = jest.fn(() => [])
        await actions.getAllTxs({
          commit,
          state,
          rootState: mockRootState
        })

        expect(node.get.txs).toHaveBeenCalled()
        expect(state.error).toBeNull()
        expect(commit).toHaveBeenCalledWith(`setHistoryLoading`, false)
      })

      it("should not load transactions if not connected", async () => {
        node.get.txs = jest.fn(() => [])
        const commit = jest.fn()
        await actions.getAllTxs({
          commit,
          state,
          rootState: Object.assign({}, mockRootState, {
            connection: {
              connected: false
            }
          })
        })
        expect(commit).toHaveBeenCalledWith(`setHistoryLoading`, true)
        expect(commit).not.toHaveBeenCalledWith(`setHistoryLoading`, false)
        expect(node.get.txs).not.toHaveBeenCalled()
      })

      it("should store an error if loading the transactions failed", async () => {
        node.get.txs = () => Promise.reject(new Error("Expected"))
        const commit = jest.fn()
        await actions.getAllTxs({
          commit,
          state,
          rootState: mockRootState
        })
        expect(commit).toHaveBeenCalledWith(`setHistoryLoading`, true)
        expect(commit).not.toHaveBeenCalledWith(`setHistoryLoading`, false)
        expect(state.error).toEqual(new Error("Expected"))
      })
    })

    describe(`enrichTransactions`, () => {
      it(`should add add time and block height`, async () => {
        const txs = [{ height: 1 }, { height: 2 }]
        const dispatch = jest
          .fn()
          .mockResolvedValue({ header: { time: 420000 } })
        const enreichedTxs = await actions.enrichTransactions(
          { dispatch },
          {
            transactions: txs,
            txType: `bank`
          }
        )

        expect(dispatch).toBeCalledTimes(txs.length)
        expect(dispatch).toHaveBeenCalledWith(`queryBlockInfo`, 1)
        expect(dispatch).toHaveBeenCalledWith(`queryBlockInfo`, 2)

        expect(enreichedTxs).toEqual([
          { height: 1, time: `1970-01-01T00:07:00.000Z`, type: `bank` },
          { height: 2, time: `1970-01-01T00:07:00.000Z`, type: `bank` }
        ])
      })
    })
  })
})
