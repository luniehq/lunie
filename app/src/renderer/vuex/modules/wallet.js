import * as Sentry from "@sentry/browser"
import Vue from "vue"
import config from "../../../config"
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
    externals: { config },
    vestedAccount: false
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
    },
    setVestedAccount(state) {
      state.vestedAccount = true
    }
  }

  const actions = {
    async reconnected({ rootState, state, dispatch }) {
      if (state.loading && state.address && rootState.session.signedIn) {
        await dispatch(`queryWalletBalances`)
      }
    },
    async initializeWallet({ state, commit, dispatch }, { address }) {
      commit(`setWalletAddress`, address)
      dispatch(`queryWalletBalances`)
        .then(() => {
          // if the account is empty and there is a faucet for that network, give the account some money
          if (state.balances.length === 0 && state.externals.config.faucet) {
            dispatch(`getMoney`, address)
          }
        })
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
        const res = await node.getAccount(state.address)
        state.error = null
        const { coins, sequence, account_number, vested } = res || {}
        commit(`setNonce`, sequence)
        commit(`setAccountNumber`, account_number)
        commit(`setWalletBalances`, coins || [])
        if (vested) {
          commit(`setVestedAccount`)
        }
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
    async simulateSendCoins(
      { dispatch },
      { receiver, amount, denom }
    ) {
      return await dispatch(`simulateTx`, {
        type: `send`,
        to: receiver,
        amount: [{ denom, amount: String(amount) }]
      })
    },
    async sendCoins(
      { dispatch, commit, state },
      { receiver, amount, denom, gas, gas_prices, password, submitType }
    ) {
      await dispatch(`sendTx`, {
        type: `send`,
        gas,
        gas_prices,
        password,
        submitType,
        to: receiver,
        amount: [{ denom, amount: String(amount) }]
      })

      const oldBalance = state.balances.find(balance => balance.denom === denom)
      commit(`updateWalletBalance`, {
        denom,
        amount: oldBalance.amount - amount
      })
      await dispatch(`getAllTxs`)
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
    walletSubscribe({ state, dispatch }) {
      if (!state.address) return
      // check if we already subscribed to this rpc object
      // we need to resubscribe on rpc reconnections
      if (state.subscribedRPC === node.rpc) return

      state.subscribedRPC = node.rpc

      function onTx(data) {
        dispatch(`queryWalletStateAfterHeight`, data.TxResult.height + 1)
      }

      const queries = [
        `tm.event = 'Tx' AND sender = '${state.address}'`,
        `tm.event = 'Tx' AND recipient = '${state.address}'`,
        `tm.event = 'Tx' AND proposer = '${state.address}'`,
        `tm.event = 'Tx' AND depositor = '${state.address}'`,
        `tm.event = 'Tx' AND delegator = '${state.address}'`,
        `tm.event = 'Tx' AND voter = '${state.address}'`
      ]

      queries.forEach(query => {
        node.rpc.subscribe(
          {
            query
          },
          onTx
        )
      })
    },
    async getMoney({ state }, address) {
      return state.externals.axios.get(`${state.externals.config.faucet}/${address}`)
    },
  }

  return {
    state,
    mutations,
    actions
  }
}
