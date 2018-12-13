import fp from "lodash/fp"
import { uniqBy } from "lodash"
import * as Sentry from "@sentry/browser"
export default ({ node }) => {
  let emptyState = {
    loading: false,
    loaded: false,
    error: null,
    wallet: [], // {height, result: { gas, tags }, tx: { type, value: { fee: { amount: [{denom, amount}], gas}, msg: {type, inputs, outputs}}, signatures} }}
    staking: [],
    governance: []
  }
  let state = JSON.parse(JSON.stringify(emptyState))

  // properties under which txs of different categories are stored
  const txCategories = [`staking`, `wallet`, `governance`]

  let mutations = {
    setWalletTxs(state, txs) {
      state.wallet = txs
    },
    setStakingTxs(state, txs) {
      state.staking = txs
    },
    setGovernanceTxs(state, txs) {
      state.governance = txs
    },
    setHistoryLoading(state, loading) {
      state.loading = loading
    },
    setTransactionTime(state, { blockHeight, blockMetaInfo }) {
      txCategories.forEach(category => {
        state[category].forEach(t => {
          if (t.height === blockHeight) {
            t.time = blockMetaInfo && blockMetaInfo.header.time
          }
        })
      })
    }
  }

  let actions = {
    resetSessionData({ rootState }) {
      // clear previous account state
      rootState.transactions = JSON.parse(JSON.stringify(emptyState))
    },
    async reconnected({ dispatch }) {
      if (state.loading) {
        await dispatch(`getAllTxs`)
      }
    },
    async getAllTxs({ commit, dispatch, state, rootState }) {
      try {
        state.loading = true

        if (!rootState.connection.connected) return

        const stakingTxs = await dispatch(`getTx`, `staking`)
        commit(`setStakingTxs`, stakingTxs)

        const governanceTxs = await dispatch(`getTx`, `governance`)
        commit(`setGovernanceTxs`, governanceTxs)

        const walletTxs = await dispatch(`getTx`, `wallet`)
        commit(`setWalletTxs`, walletTxs)

        const allTxs = stakingTxs.concat(governanceTxs.concat(walletTxs))
        await dispatch(`enrichTransactions`, {
          transactions: allTxs
        })
        state.error = null
        state.loading = false
        state.loaded = true
      } catch (error) {
        commit(`notifyError`, {
          title: `Error getting transactions`,
          body: error.message
        })
        Sentry.captureException(error)
        state.error = error
      }
    },
    async getTx(
      {
        rootState: {
          user: { address }
        }
      },
      type
    ) {
      let response
      switch (type) {
        case `staking`:
          response = await node.getDelegatorTxs(address)
          break
        case `governance`:
          response = await node.getGovernanceTxs(address)
          break
        case `wallet`:
          response = await node.txs(address)
          break
        default:
          throw new Error(`Unknown transaction type`)
      }
      const transactionsPlusType = response.map(fp.set(`type`, type))
      return response ? uniqBy(transactionsPlusType, `hash`) : []
    },
    async enrichTransactions({ dispatch }, { transactions }) {
      const blockHeights = new Set(transactions.map(({ height }) => height))
      await Promise.all(
        [...blockHeights].map(blockHeight =>
          dispatch(`queryTransactionTime`, { blockHeight })
        )
      )
    },
    async queryTransactionTime({ commit, dispatch }, { blockHeight }) {
      let blockMetaInfo = await dispatch(`queryBlockInfo`, blockHeight)
      commit(`setTransactionTime`, {
        blockHeight,
        blockMetaInfo
      })
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
