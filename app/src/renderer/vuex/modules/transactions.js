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
    setTransactionTime(state, { blockHeight, time }) {
      [`staking`, `bank`, `governance`, `distribution`]
        .forEach(category => {
          state[category].forEach(tx => {
            if (tx.height === blockHeight && time) {
              // time seems to be an ISO string, but we are expecting a Number type
              time = new Date(time).toISOString()
              Vue.set(tx, `time`, time)
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

        // TODO: add (push to state) only new transactions
        const bankTxs = await dispatch(`getTx`, `bank`)
        if (bankTxs.length > state.bank.length) {
          commit(`setBankTxs`, bankTxs)
          await dispatch(`enrichTransactions`, bankTxs)
        }

        const stakingTxs = await dispatch(`getTx`, `staking`)
        if (stakingTxs.length > state.staking.length) {
          commit(`setStakingTxs`, stakingTxs)
          await dispatch(`enrichTransactions`, stakingTxs)
        }

        const governanceTxs = await dispatch(`getTx`, `governance`)
        if (governanceTxs.length > state.governance.length) {
          commit(`setGovernanceTxs`, governanceTxs)
          await dispatch(`enrichTransactions`, governanceTxs)
        }

        const distributionTxs = await dispatch(`getTx`, `distribution`)
        if (distributionTxs.length > state.distribution.length) {
          commit(`setDistributionTxs`, distributionTxs)
          await dispatch(`enrichTransactions`, distributionTxs)
        }

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
      const validatorAddress = address.replace(`cosmos`, `cosmosvaloper`)
      switch (type) {
        case `staking`:
          response = await node.getStakingTxs(address, validatorAddress)
          break
        case `governance`:
          response = await node.getGovernanceTxs(address)
          break
        case `distribution`:
          response = await node.getDistributionTxs(address, validatorAddress)
          break
        case `bank`:
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
        time: new Date(blockMetaInfo.header.time).toISOString()
      })
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
