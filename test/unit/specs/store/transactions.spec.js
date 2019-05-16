import transactionsModule from "src/vuex/modules/transactions.js"
import { bankTxs, stakingTxs, governanceTxs, distributionTxs } from "./json/txs"

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
        bankTxs: () => Promise.resolve([{ txhash: 2 }]),
        stakingTxs: () => Promise.resolve([{ txhash: 1 }]),
        governanceTxs: () => Promise.resolve([{ txhash: 3 }, { txhash: 3 }]),
        distributionTxs: () => Promise.resolve([{ txhash: 4 }])
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
    it(`should set bank transactions `, () => {
      mutations.setBankTxs(state, bankTxs)
      expect(state.bank).toEqual(bankTxs)
    })

    it(`should set staking transactions `, () => {
      mutations.setStakingTxs(state, stakingTxs)
      expect(state.staking).toEqual(stakingTxs)
    })

    it(`should set governance transactions `, () => {
      mutations.setGovernanceTxs(state, governanceTxs)
      expect(state.governance).toEqual(governanceTxs)
    })

    it(`should set distribution transactions `, () => {
      mutations.setDistributionTxs(state, distributionTxs)
      expect(state.distribution).toEqual(distributionTxs)
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
              bank: [{}],
              staking: [{}]
            }
          }
        })
        expect(state.bank).toHaveLength(0)
        expect(state.staking).toHaveLength(0)
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

    describe(`parseAndSetTxs`, () => {
      describe(`should parse and set new txs`, () => {
        it(`bank`, async () => {
          const commit = jest.fn()
          const txs = [{ txhash: 3 }]
          const enrichedTxs = [
            {
              txhash: 3,
              time: `1970-01-01T00:07:00.000Z`,
              type: `bank`
            }
          ]
          const dispatch = jest
            .fn()
            .mockImplementationOnce(async () => await txs)
            .mockImplementationOnce(async () => await enrichedTxs)
          await actions.parseAndSetTxs(
            { commit, dispatch, state },
            { txType: `bank` }
          )

          expect(dispatch).toHaveBeenCalledWith(`getTx`, `bank`)
          expect(dispatch).toHaveBeenCalledWith(`enrichTransactions`, {
            transactions: txs,
            txType: `bank`
          })
          expect(commit).toHaveBeenCalledWith(`setBankTxs`, enrichedTxs)
        })

        it(`staking`, async () => {
          const commit = jest.fn()
          const txs = [{ txhash: 3 }]
          const enrichedTxs = [
            {
              txhash: 3,
              time: `1970-01-01T00:07:00.000Z`,
              type: `staking`
            }
          ]
          const dispatch = jest
            .fn()
            .mockImplementationOnce(async () => await txs)
            .mockImplementationOnce(async () => await enrichedTxs)
          await actions.parseAndSetTxs(
            { commit, dispatch, state },
            { txType: `staking` }
          )

          expect(dispatch).toHaveBeenCalledWith(`getTx`, `staking`)
          expect(dispatch).toHaveBeenCalledWith(`enrichTransactions`, {
            transactions: txs,
            txType: `staking`
          })
          expect(commit).toHaveBeenCalledWith(`setStakingTxs`, enrichedTxs)
        })

        it(`governance`, async () => {
          const commit = jest.fn()
          const txs = [{ txhash: 3 }, { txhash: 3 }]
          const enrichedTxs = [
            {
              txhash: 3,
              time: `1970-01-01T00:07:00.000Z`,
              type: `governance`
            }
          ]
          const dispatch = jest
            .fn()
            .mockImplementationOnce(async () => await txs)
            .mockImplementationOnce(async () => await enrichedTxs)
          await actions.parseAndSetTxs(
            { commit, dispatch, state },
            { txType: `governance` }
          )

          expect(dispatch).toHaveBeenCalledWith(`getTx`, `governance`)
          expect(dispatch).toHaveBeenCalledWith(`enrichTransactions`, {
            transactions: [txs[0]],
            txType: `governance`
          })
          expect(commit).toHaveBeenCalledWith(`setGovernanceTxs`, enrichedTxs)
        })

        it(`distribution`, async () => {
          const commit = jest.fn()
          const txs = [{ txhash: 3 }]
          const enrichedTxs = [
            {
              txhash: 3,
              time: `1970-01-01T00:07:00.000Z`,
              type: `distribution`
            }
          ]
          const dispatch = jest
            .fn()
            .mockImplementationOnce(async () => await txs)
            .mockImplementationOnce(async () => await enrichedTxs)
          await actions.parseAndSetTxs(
            { commit, dispatch, state },
            { txType: `distribution` }
          )

          expect(dispatch).toHaveBeenCalledWith(`getTx`, `distribution`)
          expect(dispatch).toHaveBeenCalledWith(`enrichTransactions`, {
            transactions: txs,
            txType: `distribution`
          })
          expect(commit).toHaveBeenCalledWith(`setDistributionTxs`, enrichedTxs)
        })

        it(`other`, async () => {
          const commit = jest.fn()
          const txs = [{ txhash: 3 }]
          const enrichedTxs = [
            {
              txhash: 3,
              time: `1970-01-01T00:07:00.000Z`,
              type: `other`
            }
          ]
          const dispatch = jest
            .fn()
            .mockImplementationOnce(async () => await txs)
            .mockImplementationOnce(async () => await enrichedTxs)
          await actions.parseAndSetTxs(
            { commit, dispatch, state },
            { txType: `other` }
          )

          expect(dispatch).toHaveBeenCalledWith(`getTx`, `other`)
          expect(dispatch).not.toHaveBeenCalledWith(`enrichTransactions`, {
            transactions: txs,
            txType: `other`
          })
          expect(commit).not.toHaveBeenCalled()
        })
      })

      it(`shouldn't set txs that already exist in state`, async () => {
        state = {
          loading: false,
          loaded: false,
          error: null,
          bank: bankTxs
        }
        const commit = jest.fn()
        const dispatch = jest.fn().mockImplementation(async () => await bankTxs)
        await actions.parseAndSetTxs(
          { commit, dispatch, state },
          { txType: `bank` }
        )

        expect(dispatch).toHaveBeenCalledWith(`getTx`, `bank`)
        expect(dispatch).not.toHaveBeenCalledWith(`enrichTransactions`, {
          transactions: bankTxs,
          txType: `bank`
        })

        expect(commit).not.toHaveBeenCalledWith(`setBankTxs`, bankTxs)
        expect(state.error).toBeNull()
      })
    })

    describe(`getAllTxs`, () => {
      it(`should get all types of txs`, async () => {
        const dispatch = jest.fn()
        await actions.getAllTxs({
          commit,
          dispatch,
          state,
          rootState: mockRootState
        })

        expect(commit).toHaveBeenCalledWith(`setHistoryLoading`, true)
        expect(dispatch).toHaveBeenCalledTimes(4)
        expect(dispatch).toHaveBeenCalledWith(`parseAndSetTxs`, {
          txType: `bank`
        })
        expect(dispatch).toHaveBeenCalledWith(`parseAndSetTxs`, {
          txType: `staking`
        })
        expect(dispatch).toHaveBeenCalledWith(`parseAndSetTxs`, {
          txType: `governance`
        })
        expect(dispatch).toHaveBeenCalledWith(`parseAndSetTxs`, {
          txType: `distribution`
        })
        expect(state.error).toBeNull()
        expect(commit).toHaveBeenCalledWith(`setHistoryLoading`, false)
      })

      it("should not load transactions if not connected", async () => {
        const dispatch = jest.fn()
        const commit = jest.fn()
        await actions.getAllTxs({
          commit,
          dispatch,
          state,
          rootState: Object.assign({}, mockRootState, {
            connection: {
              connected: false
            }
          })
        })
        expect(commit).toHaveBeenCalledWith(`setHistoryLoading`, true)
        expect(commit).not.toHaveBeenCalledWith(`setHistoryLoading`, false)
        expect(dispatch).toHaveBeenCalledTimes(0)
      })

      it("should store an error if loading the transactions failed", async () => {
        const dispatch = () => Promise.reject(new Error("Expected"))
        const commit = jest.fn()
        await actions.getAllTxs({
          commit,
          dispatch,
          state,
          rootState: mockRootState
        })
        expect(commit).toHaveBeenCalledWith(`setHistoryLoading`, true)
        expect(commit).not.toHaveBeenCalledWith(`setHistoryLoading`, false)
        expect(state.error).toEqual(new Error("Expected"))
      })
    })

    describe(`getTx`, () => {
      it(`should fetch staking txs`, async () => {
        const staking = await actions.getTx(
          { rootState: { session: { address } } },
          `staking`
        )
        expect(staking).toEqual([{ txhash: 1 }])
      })

      it(`should fetch governance txs`, async () => {
        const governance = await actions.getTx(
          { rootState: { session: { address } } },
          `governance`
        )
        expect(governance).toEqual([{ txhash: 3 }, { txhash: 3 }])
      })

      it(`should fetch bank txs`, async () => {
        const bank = await actions.getTx(
          { rootState: { session: { address } } },
          `bank`
        )
        expect(bank).toEqual([{ txhash: 2 }])
      })

      it(`should fetch distribution txs`, async () => {
        const distribution = await actions.getTx(
          { rootState: { session: { address } } },
          `distribution`
        )
        expect(distribution).toEqual([{ txhash: 4 }])
      })

      it(`should fetch txs with empty response`, async () => {
        node = {
          get: {
            distributionTxs: () => Promise.resolve(null)
          }
        }

        const moduleInstance = transactionsModule({ node })
        const distribution = await moduleInstance.actions.getTx(
          { rootState: { session: { address } } },
          `distribution`
        )
        expect(distribution).toEqual([])
      })

      it(`should throw error`, async () => {
        try {
          await actions.getTx(
            { rootState: { session: { address } } },
            `zero-knowledge`
          )
        } catch (error) {
          expect(error.message).toBe(`Unknown transaction type: zero-knowledge`)
        }
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
