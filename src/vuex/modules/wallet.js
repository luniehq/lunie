import * as Sentry from "@sentry/browser"
import Vue from "vue"
import config from "src/config"
import axios from "axios"

export default ({ node }) => {
  const emptyState = {
    balances: [],
    loading: true,
    loaded: false,
    error: null,
    accountNumber: null,
    address: null,
    subscribedRPC: null,
    externals: { config }
  }
  const state = JSON.parse(JSON.stringify(emptyState))
  state.externals.axios = axios

  const mutations = {
    setWalletBalances(state, balances) {
      Vue.set(state, `balances`, balances)
      Vue.set(state, `loading`, false)
    },
    updateWalletBalance(state, balance) {
      const findBalanceIndex = state.balances.findIndex(
        ({ denom }) => balance.denom === denom
      )
      if (findBalanceIndex === -1) {
        state.balances.push(balance)
        return
      }
      Vue.set(state.balances, findBalanceIndex, balance)
    },
    setWalletAddress(state, address) {
      state.address = address
    },
    setAccountNumber(state, accountNumber) {
      state.accountNumber = accountNumber
    }
  }

  const actions = {
    async reconnected({ rootState, state, dispatch }) {
      if (state.loading && state.address && rootState.session.signedIn) {
        await dispatch(`queryWalletBalances`)
      }
    },
    async initializeWallet({ commit, dispatch }, { address }) {
      commit(`setWalletAddress`, address)
      dispatch(`queryWalletBalances`)
      dispatch(`getTotalRewards`)
      dispatch(`walletSubscribe`)
    },
    resetSessionData({ rootState }) {
      // clear previous account state
      rootState.wallet = JSON.parse(JSON.stringify(emptyState))
      rootState.wallet.externals.axios = axios
    },
    async queryWalletBalances({ state, rootState, commit }) {
      if (!state.address) return

      state.loading = true
      if (!rootState.connection.connected) return

      try {
        const res = await node.get.account(state.address)
        state.error = null
        const { coins, account_number } = res || {}
        commit(`setAccountNumber`, account_number)
        commit(`setWalletBalances`, coins || [])
        state.loading = false
        state.loaded = true
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching balances`,
          body: error.message
        })
        Sentry.captureException(error)
        state.error = error
      }
    },
    queryWalletStateAfterHeight({ rootState, dispatch }, height) {
      return new Promise(resolve => {
        // wait until height is >= `height`
        const interval = setInterval(() => {
          if (rootState.connection.lastHeader.height < height) return
          clearInterval(interval)
          dispatch(`queryWalletBalances`)
          dispatch(`getBondedDelegates`)
          resolve()
        }, 1000)
      })
    },
    walletSubscribe({ rootState, dispatch }) {
      if (!rootState.session.address) return
      // check if we already subscribed to this rpc object
      // we need to resubscribe on rpc reconnections
      if (state.subscribedRPC === node.rpc) return

      state.subscribedRPC = node.rpc

      subscribeToTxs(node.rpc, rootState.session.address, dispatch)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}

function subscribeToTxs(rpcClient, address, dispatch) {
  function onTx(data) {
    console.log(data)
    dispatch(`queryWalletStateAfterHeight`, data.TxResult.height + 1)
  }

  const queries = [
    `tm.event = 'Tx' AND sender = '${address}'`,
    `tm.event = 'Tx' AND recipient = '${address}'`,
    `tm.event = 'Tx' AND proposer = '${address}'`,
    `tm.event = 'Tx' AND depositor = '${address}'`,
    `tm.event = 'Tx' AND delegator = '${address}'`,
    `tm.event = 'Tx' AND voter = '${address}'`
  ]

  queries.forEach(query => {
    rpcClient
      .subscribe(
        {
          query
        },
        onTx
      )
      .catch(err => {
        // TODO Output error like this to not trigger Sentry
        console.error(err)
      })
  })
}
