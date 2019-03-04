import transactionsModule from "renderer/vuex/modules/transactions.js"
import {
  allTxs,
  bankTxs,
  stakingTxs,
  governanceTxs,
  distributionTxs
} from "./json/txs"

describe(`Module: Transactions`, () => {
  let module, state, actions, mutations, node
  const address = `cosmos1address`
  const dispatch = jest.fn()
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

  describe(`Mutations`, () => {
    it(`should set bank transactions `, () => {
      mutations.setBankTxs(state, bankTxs)
      expect(state.bank).toBe(bankTxs)
    })

    it(`should set staking transactions `, () => {
      mutations.setStakingTxs(state, stakingTxs)
      expect(state.staking).toBe(stakingTxs)
    })

    it(`should set governance transactions `, () => {
      mutations.setGovernanceTxs(state, governanceTxs)
      expect(state.governance).toBe(governanceTxs)
    })

    it(`should set distribution transactions `, () => {
      mutations.setDistributionTxs(state, distributionTxs)
      expect(state.distribution).toBe(distributionTxs)
    })

    it(`should set history loading`, () => {
      mutations.setHistoryLoading(state, false)
      expect(state.loading).toEqual(false)
    })

    it(`should set transaction time`, () => {
      state.staking = [{ height: 150 }]
      mutations.setTransactionTime(state, {
        blockHeight: 150,
        time: `2018-10-15T00:05:32.000Z`
      })
      expect(state.staking).toEqual([{ height: 150, time: 1539561932000 }])
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

    describe(`getAllTxs`, () => {
      it(`should get txs`, async () => {
        const dispatch = jest
          .fn()
          .mockImplementationOnce(async () => await bankTxs)
          .mockImplementationOnce(async () => await stakingTxs)
          .mockImplementationOnce(async () => await governanceTxs)
          .mockImplementationOnce(async () => await distributionTxs)
        await actions.getAllTxs({
          commit,
          dispatch,
          state,
          rootState: mockRootState
        })

        expect(dispatch).toHaveBeenCalledWith(`getTx`, `bank`)
        expect(dispatch).toHaveBeenCalledWith(`getTx`, `staking`)
        expect(dispatch).toHaveBeenCalledWith(`getTx`, `governance`)
        expect(dispatch).toHaveBeenCalledWith(`getTx`, `distribution`)

        expect(dispatch).toHaveBeenCalledWith(`enrichTransactions`, allTxs)

        expect(commit).toHaveBeenCalledWith(`setBankTxs`, bankTxs)
        expect(commit).toHaveBeenCalledWith(`setStakingTxs`, stakingTxs)
        expect(commit).toHaveBeenCalledWith(`setGovernanceTxs`, governanceTxs)
        expect(commit).toHaveBeenCalledWith(`setDistributionTxs`, distributionTxs)
        expect(state.error).toBeNull()
      })

      it(`should throw if if one of the dispatches fail`, async () => {
        const error = new Error(`unexpected error`)
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

        try {
          await actions.getTx(
            { rootState: { session: { address } } },
            `zero-knowledge`)
        } catch (error) {
          expect(error.message).toBe(`Unknown transaction type`)
        }
      })
    })

    describe(`enrichTransactions`, () => {
      it(`should add add time and block height`, async () => {
        const txs = [{ height: 1 }, { height: 2 }]
        await actions.enrichTransactions({ dispatch }, txs)
        expect(dispatch).toHaveBeenCalledWith(`queryTransactionTime`, {
          blockHeight: 1
        })
        expect(dispatch).toHaveBeenCalledWith(`queryTransactionTime`, {
          blockHeight: 2
        })
      })
    })

    describe(`queryTransactionTime`, () => {
      it(`should add add time and block height`, async () => {
        const blockMetaInfo = { header: { time: `2018-10-15T00:05:32.000Z` } }
        const dispatch = jest.fn(async () => await blockMetaInfo)
        await actions.queryTransactionTime(
          { commit, dispatch },
          { blockHeight: 1 }
        )
        expect(dispatch).toHaveBeenCalledWith(`queryBlockInfo`, 1)
        expect(commit).toHaveBeenCalledWith(`setTransactionTime`, {
          blockHeight: 1,
          time: `2018-10-15T00:05:32.000Z`
        })
      })
    })
  })
})
