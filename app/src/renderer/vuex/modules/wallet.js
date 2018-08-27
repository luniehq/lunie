let fs = require("fs-extra")
let { join } = require("path")
let { uniqBy } = require("lodash")
const { remote } = require("electron")
const root = remote.getGlobal("root")
let { sleep } = require("scripts/common.js")

export default ({ node }) => {
  let emptyState = {
    balances: [],
    balancesLoading: true,
    history: [], // {height, result: { gas, tags }, tx: { type, value: { fee: { amount: [{denom, amount}], gas}, msg: {type, inputs, outputs}}, signatures} }}
    historyLoading: false,
    denoms: [],
    address: null,
    zoneIds: ["basecoind-demo1", "basecoind-demo2"],
    subscribedRPC: null
  }
  let state = JSON.parse(JSON.stringify(emptyState))

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
      commit("setWalletAddress", address)
      dispatch("loadDenoms")
      dispatch("queryWalletState")
      dispatch("walletSubscribe")
    },
    resetSessionData({ rootState }) {
      // clear previous account state
      rootState.wallet = JSON.parse(JSON.stringify(emptyState))
    },
    queryWalletState({ dispatch }) {
      dispatch("queryWalletBalances")
      // dispatch("queryWalletHistory") // is done on mounting transactions
    },
    async queryWalletBalances({ state, rootState, commit }) {
      if (!state.address) return

      let res = await node.queryAccount(state.address)
      if (!res) {
        state.balancesLoading = false
        return
      }
      let coins = res.coins || []
      commit("setNonce", res.sequence)
      commit("setAccountNumber", res.account_number)
      commit("setWalletBalances", coins)
      for (let coin of coins) {
        if (coin.denom === rootState.config.bondingDenom.toLowerCase()) {
          commit("setAtoms", parseFloat(coin.amount))
          break
        }
      }

      state.balancesLoading = false
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
    async loadDenoms({ commit }) {
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
      let denoms = []
      for (let account of genesis.app_state.accounts) {
        if (account.coins) {
          for (let { denom } of account.coins) {
            denoms.push(denom)
          }
        }
      }

      commit("setDenoms", denoms)
    },
    queryWalletStateAfterHeight({ rootState, dispatch }, height) {
      return new Promise(resolve => {
        // wait until height is >= `height`
        let interval = setInterval(() => {
          if (rootState.node.lastHeader.height < height) return
          clearInterval(interval)
          dispatch("queryWalletState")
          resolve()
        }, 1000)
      })
    },
    walletSubscribe({ state, dispatch }) {
      if (!state.address) return
      // check if we already subscribed to this rpc object
      // we need to resubscribe on rpc reconnections
      if (state.subscribedRPC === node.rpc) return

      state.subscribedRPC = node.rpc

      function onTx(err, event) {
        if (err) {
          return console.error("error subscribing to transactions", err)
        }
        dispatch(
          "queryWalletStateAfterHeight",
          event.data.value.TxResult.height + 1
        )
      }

      node.rpc.subscribe(
        {
          query: `tm.event = 'Tx' AND sender = '${state.address}'`
        },
        onTx
      )

      node.rpc.subscribe(
        {
          query: `tm.event = 'Tx' AND recipient = '${state.address}'`
        },
        onTx
      )
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
