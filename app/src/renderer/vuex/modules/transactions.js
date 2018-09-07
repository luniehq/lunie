const fp = require(`lodash/fp`)
import { uniqBy } from "lodash"
export default ({ node }) => {
  let emptyState = {
    loading: false,
    wallet: [], // {height, result: { gas, tags }, tx: { type, value: { fee: { amount: [{denom, amount}], gas}, msg: {type, inputs, outputs}}, signatures} }}
    staking: []
  }
  let state = JSON.parse(JSON.stringify(emptyState))

  // properties under which txs of different categories are store
  const txCategories = ["staking", "wallet"]

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
        await dispatch("getAllTxs")
      }
    },
    async getAllTxs({ commit, dispatch }) {
      commit("setHistoryLoading", true)
      const stakingTxs = await dispatch("getTx", "staking")
      commit("setStakingTxs", stakingTxs)

      const walletTxs = await dispatch("getTx", "wallet")
      commit("setWalletTxs", walletTxs)

      const allTxs = stakingTxs.concat(walletTxs)
      await dispatch("enrichTransactions", {
        transactions: allTxs
      })
      commit("setHistoryLoading", false)
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
        case "staking":
          response = await node.getDelegatorTxs(address)
          break
        case "wallet":
          response = await node.txs(address)
          break
        default:
          throw new Error("Unknown transaction type")
      }
      const transactionsPlusType = response.map(fp.set(`type`, type))
      return response ? uniqBy(transactionsPlusType, "hash") : []
    },
    async enrichTransactions({ dispatch }, { transactions }) {
      const blockHeights = new Set(transactions.map(({ height }) => height))
      await Promise.all(
        [...blockHeights].map(blockHeight =>
          dispatch("queryTransactionTime", { blockHeight })
        )
      )
    },
    async queryTransactionTime({ commit, dispatch }, { blockHeight }) {
      let blockMetaInfo = await dispatch("queryBlockInfo", blockHeight)
      commit("setTransactionTime", {
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
