let { uniqBy } = require("lodash")

export default ({ node }) => {
  let state = {
    loading: false,
    wallet: [], // {height, result: { gas, tags }, tx: { type, value: { fee: { amount: [{denom, amount}], gas}, msg: {type, inputs, outputs}}, signatures} }}
    staking: []
  }

  let mutations = {
    setWalletTxs(state, txs) {
      state.wallet = txs
    },
    setStakingTxs(state, txs) {
      state.staking = txs
    },
    setHistoryLoading(state, loading) {
      state.loading = loading
    },
    setTransactionTime(state, { scope, blockHeight, blockMetaInfo }) {
      state[scope] = state[scope].map(t => {
        if (t.height === blockHeight) {
          t.time = blockMetaInfo && blockMetaInfo.header.time
        }
        return t
      })
    }
  }

  let actions = {
    async getAllTxs({ commit, dispatch }) {
      commit("setHistoryLoading", true)
      const stakingTxs = await dispatch("getTx", "staking")
      commit("setStakingTxs", stakingTxs)

      const walletTxs = await dispatch("getTx", "wallet")
      commit("setWalletTxs", walletTxs)

      const allTxs = stakingTxs.concat(walletTxs)
      await dispatch("enrichTransactions", {
        transactions: allTxs,
        scopes: ["staking", "wallet"]
      })
      commit("setHistoryLoading", false)
    },
    // after creating getAllTxs, getStakingTxs and getWalletTxs are no longer
    // referenced anywhere. keeping them here in case there is need for them later
    // async getStakingTxs({ commit, dispatch, rootState }) {
    //   commit("setHistoryLoading", true)
    //   const transactions = await dispatch("getTx", "staking")
    //   commit("setStakingTxs", transactions)
    //
    //   await dispatch("enrichTransactions", {
    //     transactions,
    //     scopes: ["staking"]
    //   })
    //   commit("setHistoryLoading", false)
    // },
    // async getWalletTxs({ rootState, commit, dispatch }) {
    //   commit("setHistoryLoading", true)
    //   const transactions = await dispatch("getTx", "wallet")
    //   commit("setStakingTxs", transactions)
    //
    //   await dispatch("enrichTransactions", {
    //     transactions,
    //     scopes: ["wallet"]
    //   })
    //   commit("setHistoryLoading", false)
    // },
    async getTx({ commit, rootState }, type) {
      let address = rootState.user.address
      let res
      switch (type) {
        case "staking":
          res = await node.getDelegatorTxs(address)
          break
        case "wallet":
          res = await node.txs(rootState.user.address)
          break
        default:
          throw new Error("Unknown transaction type")
      }
      if (!res) return []
      res = res.map(r => {
        r.type = type
        return r
      })
      return uniqBy(res, "hash")
    },
    async enrichTransactions({ dispatch }, { transactions, scopes = [] }) {
      let blockHeights = []
      transactions.forEach(t => {
        if (!blockHeights.find(h => h === t.height)) {
          blockHeights.push(t.height)
        }
      })
      await Promise.all(
        blockHeights.map(blockHeight =>
          dispatch("queryTransactionTime", { blockHeight, scopes })
        )
      )
    },
    async queryTransactionTime(
      { commit, dispatch },
      { blockHeight, scopes = [] }
    ) {
      let blockMetaInfo = await dispatch("queryBlockInfo", blockHeight)
      scopes.forEach(scope => {
        commit("setTransactionTime", {
          scope,
          blockHeight,
          blockMetaInfo
        })
      })
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
