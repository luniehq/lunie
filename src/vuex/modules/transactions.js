import Vue from "vue"

// TODO simplify with one call

export default ({ node }) => {
  const emptyState = {
    loading: false,
    loaded: false,
    error: null,
    txs: []
  }

  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setHistoryLoading(state, loading) {
      Vue.set(state, `loading`, loading)
    },
    setTxs(state, txs) {
      state.txs = txs
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
    async loadTxs({ commit }) {
      const txs = await node.txs()
      commit("setTxs", txs)
    },
    async getAllTxs({ commit, state, rootState }) {
      try {
        commit(`setHistoryLoading`, true)

        if (!rootState.connection.connected) {
          return
        }

        const txs = await node.get.txs(rootState.session.address)
        state.txs = txs

        state.error = null
        commit(`setHistoryLoading`, false)
        state.loaded = true
      } catch (error) {
        state.error = error
      }
    },
    async enrichTransactions({ dispatch }, { transactions, txType }) {
      const enrichedTransactions = await Promise.all(
        transactions.map(async tx => {
          const blockMetaInfo = await dispatch(`queryBlockInfo`, tx.height)
          const enrichedTx = Object.assign({}, tx, {
            type: txType,
            time: new Date(blockMetaInfo.header.time).toISOString()
          })
          return enrichedTx
        })
      )
      return enrichedTransactions
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
