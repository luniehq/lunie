let fs = require("fs-extra")
let { join } = require("path")
let { uniqBy } = require("lodash")
const { remote } = require("electron")
const root = remote.getGlobal("root")
let { sleep } = require("scripts/common.js")

export default ({ commit, node }) => {
  let state = {
    balances: [],
    balancesLoading: true,
    history: [], // {height, result: { gas, tags }, tx: { type, value: { fee: { amount: [{denom, amount}], gas}, msg: {type, inputs, outputs}}, signatures} }}
    historyLoading: false,
    denoms: [],
    address: null,
    zoneIds: ["basecoind-demo1", "basecoind-demo2"]
  }

  let mutations = {
    setHistoryLoading(state, loading) {
      state.historyLoading = loading
    },
    setWalletBalances(state, balances) {
      state.balances = balances
      state.balancesLoading = false
    },
    setWalletAddress(state, address) {
      state.address = address
    },
    setAccountNumber(state, accountNumber) {
      state.accountNumber = accountNumber
    },
    setWalletHistory(state, history) {
      state.history = history
    },
    setDenoms(state, denoms) {
      state.denoms = denoms
    },
    setTransactionTime(state, { blockHeight, blockMetaInfo }) {
      state.history = state.history.map(t => {
        if (t.height === blockHeight) {
          // console.log("blockMetaInfo", blockMetaInfo)
          t.time = blockMetaInfo && blockMetaInfo.header.time
        }
        return t
      })
    }
  }

  let actions = {
    reconnected({ state, dispatch }) {
      if (state.balancesLoading && state.address) {
        dispatch("queryWalletBalances")
      }
      if (state.historyLoading) {
        dispatch("queryWalletHistory")
      }
    },
    initializeWallet({ commit, dispatch }, address) {
      // clear previous account state
      state.balances = []
      state.history = []

      commit("setWalletAddress", address)
      dispatch("loadDenoms")
      dispatch("queryWalletState")
    },
    queryWalletState({ state, dispatch }) {
      dispatch("queryWalletBalances")
      dispatch("queryWalletHistory")
    },
    async queryWalletBalances({ state, rootState, commit, dispatch }) {
      let res = await node.queryAccount(state.address)
      if (!res) {
        state.balancesLoading = false
        return
      }
      commit("setNonce", res.sequence)
      commit("setAccountNumber", res.account_number)
      commit("setWalletBalances", res.coins)
      for (let coin of res.coins) {
        if (coin.denom === rootState.config.bondingDenom) {
          commit("setAtoms", parseFloat(coin.amount))
          break
        }
      }

      state.balancesLoading = false

      await sleep(3000)
      dispatch("queryWalletBalances")
    },
    async queryWalletHistory({ state, commit, dispatch }) {
      commit("setHistoryLoading", true)
      const res = await node.txs(state.address)
      if (!res) return

      const uniqueTransactions = uniqBy(res, "hash")
      commit("setWalletHistory", uniqueTransactions)

      await dispatch("enrichTransactions", uniqueTransactions)

      commit("setHistoryLoading", false)
    },
    async enrichTransactions({ dispatch }, transactions) {
      let blockHeights = []
      transactions.forEach(t => {
        if (!blockHeights.find(h => h === t.height)) {
          blockHeights.push(t.height)
        }
      })
      await Promise.all(
        blockHeights.map(h => dispatch("queryTransactionTime", h))
      )
    },
    async queryTransactionTime({ commit, dispatch }, blockHeight) {
      let blockMetaInfo = await dispatch("queryBlockInfo", blockHeight)
      // console.log(
      //   "received blockMetaInfo at height " + blockHeight,
      //   blockMetaInfo
      // )
      commit("setTransactionTime", { blockHeight, blockMetaInfo })
    },
    async loadDenoms({ state, commit }) {
      // read genesis.json to get default denoms

      // wait for genesis.json to exist
      let genesisPath = join(root, "genesis.json")
      while (true) {
        try {
          await fs.pathExists(genesisPath)
          break
        } catch (err) {
          console.log("waiting for genesis", err, genesisPath)
          await sleep(500)
        }
      }

      let genesis = await fs.readJson(genesisPath)
      let denoms = {}
      for (let account of genesis.app_state.accounts) {
        for (let { denom } of account.coins) {
          denoms[denom] = true
        }
      }

      commit("setDenoms", Object.keys(denoms))
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
