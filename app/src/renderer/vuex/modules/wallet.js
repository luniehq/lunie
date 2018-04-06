let fs = require("fs-extra")
let { join } = require("path")
let root = require("../../../root.js")

export default ({ commit, node }) => {
  let state = {
    balances: [],
    balancesLoading: false,
    address: "",
    history: [],
    historyLoading: false,
    denoms: [],
    zoneIds: ["basecoind-demo1", "basecoind-demo2"]
  }

  let mutations = {
    setWalletBalances(state, balances) {
      state.balances = balances
    },
    setWalletAddress(state, address) {
      state.address = address
      // clear previous account state
      state.balances = []
      state.history = []
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
          t.time = blockMetaInfo.header.time
        }
        return t
      })
    }
  }

  let actions = {
    reconnected({ state, dispatch }) {
      if (state.balancesLoading) {
        dispatch("queryWalletBalances")
      }
      if (state.historyLoading) {
        dispatch("queryWalletHistory")
      }
    },
    initializeWallet({ commit, dispatch }, address) {
      commit("setWalletAddress", address)
      dispatch("loadDenoms")
      dispatch("queryWalletState")
    },
    queryWalletState({ state, dispatch }) {
      dispatch("queryWalletBalances")
      dispatch("queryWalletHistory")
    },
    async queryWalletBalances({ state, rootState, commit, dispatch }) {
      state.balancesLoading = true

      let res = await node.queryAccount(state.address)
      if (res) {
        commit("setNonce", res.sequence)
        commit("setWalletBalances", res.coins)
        for (let coin of res.coins) {
          if (coin.denom === rootState.config.bondingDenom) {
            commit("setAtoms", coin.amount)
            break
          }
        }
      }

      state.balancesLoading = false

      await sleep(3000)
      dispatch("queryWalletBalances")
    },
    async queryWalletHistory({ state, commit, dispatch }) {
      state.historyLoading = true
      // let res = await node.coinTxs(state.address)
      // XXX
      let res = []
      if (!res) return
      commit("setWalletHistory", res)

      let blockHeights = []
      res.forEach(t => {
        if (!blockHeights.find(h => h === t.height)) {
          blockHeights.push(t.height)
        }
      })
      await Promise.all(
        blockHeights.map(h => dispatch("queryTransactionTime", h))
      )
      state.historyLoading = false
    },
    async queryTransactionTime({ commit, dispatch }, blockHeight) {
      let blockMetaInfo = await dispatch("queryBlockInfo", blockHeight)
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
