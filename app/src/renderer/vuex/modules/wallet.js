import Raven from "raven-js"
import fs from "fs-extra"
import { join } from "path"
import { remote } from "electron"
import { sleep } from "scripts/common.js"
const root = remote.getGlobal(`root`)

export default ({ node }) => {
  let emptyState = {
    balances: [],
    loading: true,
    loaded: false,
    error: null,
    denoms: [],
    address: null,
    subscribedRPC: null
  }
  let state = JSON.parse(JSON.stringify(emptyState))

  let mutations = {
    setWalletBalances(state, balances) {
      state.balances = balances
      state.loading = false
    },
    setWalletAddress(state, address) {
      state.address = address
    },
    setAccountNumber(state, accountNumber) {
      state.accountNumber = accountNumber
    },
    setDenoms(state, denoms) {
      state.denoms = denoms
    }
  }

  let actions = {
    reconnected({ state, dispatch }) {
      if (state.loading && state.address) {
        dispatch(`queryWalletBalances`)
      }
    },
    initializeWallet({ commit, dispatch }, address) {
      commit(`setWalletAddress`, address)
      dispatch(`loadDenoms`)
      dispatch(`queryWalletState`)
      dispatch(`walletSubscribe`)
    },
    resetSessionData({ rootState }) {
      // clear previous account state
      rootState.wallet = JSON.parse(JSON.stringify(emptyState))
    },
    queryWalletState({ dispatch }) {
      dispatch(`queryWalletBalances`)
    },
    async queryWalletBalances({ state, rootState, commit }) {
      if (!state.address) return

      state.loading = true
      if (!rootState.connection.connected) return

      try {
        let res = await node.queryAccount(state.address)
        if (!res) {
          state.loading = false
          state.loaded = true
          return
        }
        state.error = null
        let coins = res.coins || []
        commit(`setNonce`, res.sequence)
        commit(`setAccountNumber`, res.account_number)
        commit(`setWalletBalances`, coins)
        for (let coin of coins) {
          if (coin.denom === rootState.config.bondingDenom.toLowerCase()) {
            commit(`setAtoms`, parseFloat(coin.amount))
            break
          }
        }
        state.loading = false
        state.loaded = true
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching balances`,
          body: error.message
        })
        Raven.captureException(error)
        state.error = error
      }
    },
    async loadDenoms({ commit, state }, maxIterations = 10) {
      // read genesis.json to get default denoms

      // wait for genesis.json to exist
      let genesisPath = join(root, `genesis.json`)

      // wait for the genesis and load it
      // at some point give up and throw an error
      while (maxIterations) {
        try {
          await fs.pathExists(genesisPath)
          break
        } catch (error) {
          console.log(`waiting for genesis`, error, genesisPath)
          maxIterations--
          await sleep(500)
        }
      }
      if (maxIterations === 0) {
        const error = new Error(`Couldn't load genesis at path ${genesisPath}`)
        Raven.captureException(error)
        state.error = error
        return
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

      commit(`setDenoms`, denoms)
    },
    queryWalletStateAfterHeight({ rootState, dispatch }, height) {
      return new Promise(resolve => {
        // wait until height is >= `height`
        let interval = setInterval(() => {
          if (rootState.connection.lastHeader.height < height) return
          clearInterval(interval)
          dispatch(`queryWalletState`)
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

      function onTx(error, event) {
        if (error) {
          Raven.captureException(error)
          console.error(`error subscribing to transactions`, error)
          return
        }
        dispatch(
          `queryWalletStateAfterHeight`,
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
