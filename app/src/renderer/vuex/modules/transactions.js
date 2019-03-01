import { uniqBy } from "lodash"
import * as Sentry from "@sentry/browser"
import Vue from "vue"
export default ({ node }) => {
  const emptyState = {
    loading: false,
    loaded: false,
    error: null,
    bank: [], // {height, result: { gas, tags }, tx: { type, value: { fee: { amount: [{denom, amount}], gas}, msg: {type, inputs, outputs}}, signatures} }}
    staking: [],
    governance: [],
    distribution: []
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  // properties under which txs of different categories are stored
  const txCategories = [`staking`, `wallet`, `governance`, `distribution`]

  const mutations = {
    setBankTxs(state, txs) {
      Vue.set(state, `bank`, txs)
    },
    setStakingTxs(state, txs) {
      Vue.set(state, `staking`, txs)
    },
    setGovernanceTxs(state, txs) {
      Vue.set(state, `governance`, txs)
    },
    setDistributionTxs(state, txs) {
      Vue.set(state, `distribution`, txs)
    },
    setHistoryLoading(state, loading) {
      Vue.set(state, `loading`, loading)
    },
    setTransactionTime(state, { blockHeight, blockMetaInfo }) {
      txCategories.forEach(category => {
        state[category].forEach(tx => {
          if (tx.height === blockHeight && blockMetaInfo) {
            // time seems to be an ISO string, but we are expecting a Number type
            Vue.set(tx, `time`, new Date(blockMetaInfo.header.time).getTime())
          }
        })
      })
    }
  }

  const actions = {
    resetSessionData({ rootState }) {
      // clear previous account state
      rootState.transactions = JSON.parse(JSON.stringify(emptyState))
    },
    async reconnected({ state, dispatch, rootState }) {
      // TODO: remove signedIn check when we support the option for setting a custom address for txs page
      if (state.loading && rootState.session.signedIn) {
        await dispatch(`getAllTxs`)
      }
    },
    async getAllTxs({ commit, dispatch, state, rootState }) {
      try {
        commit(`setHistoryLoading`, true)

        if (!rootState.connection.connected) return

        const stakingTxs = await dispatch(`getTx`, `staking`)
        commit(`setStakingTxs`, stakingTxs)

        const governanceTxs = await dispatch(`getTx`, `governance`)
        commit(`setGovernanceTxs`, governanceTxs)

        const distributionTxs = await dispatch(`getTx`, `distribution`)
        commit(`setDistributionTxs`, distributionTxs)

        const bankTxs = await dispatch(`getTx`, `wallet`)
        commit(`setBankTxs`, bankTxs)

        const allTxs = stakingTxs.concat(governanceTxs, bankTxs, distributionTxs)
        await dispatch(`enrichTransactions`, allTxs)
        state.error = null
        commit(`setHistoryLoading`, false)
        state.loaded = true
      } catch (error) {
        Sentry.captureException(error)
        state.error = error
      }
    },
    async getTx({ rootState: { session: { address } } }, type) {
      let response
      switch (type) {
        case `staking`:
          response = await node.getStakingTxs(address)
          break
        case `governance`:
          response = await node.getGovernanceTxs(address)
          break
        case `distribution`:
          response = await node.getDistributionTxs(address)
          break
        case `wallet`:
          response = await node.txs(address)
          break
        default:
          throw new Error(`Unknown transaction type`)
      }
      const transactionsPlusType = response.map(t => ({ ...t, type }))
      return response ? uniqBy(transactionsPlusType, `txhash`) : []
    },
    async enrichTransactions({ dispatch }, transactions) {
      const blockHeights = new Set(
        transactions.map(({ height }) => parseInt(height))
      )
      await Promise.all(
        [...blockHeights].map(blockHeight =>
          dispatch(`queryTransactionTime`, { blockHeight })
        )
      )
    },
    async queryTransactionTime({ commit, dispatch }, { blockHeight }) {
      const blockMetaInfo = await dispatch(`queryBlockInfo`, blockHeight)
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
