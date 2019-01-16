import * as Sentry from "@sentry/browser"
// for now importing the fixed genesis for the network from the config.json
import network from "../../../network.js"

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
    updateWalletBalance(state, balance) {
      let updated = false
      state.balances = state.balances.map(oldBalance => {
        if (oldBalance.denom === balance.denom) {
          updated = true
          return balance
        }
        return oldBalance
      })

      if (!updated) {
        state.balances.push(balance)
      }
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
      dispatch(`queryWalletBalances`)
      dispatch(`loadDenoms`)
      dispatch(`walletSubscribe`)
    },
    resetSessionData({ rootState }) {
      // clear previous account state
      rootState.wallet = JSON.parse(JSON.stringify(emptyState))
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
    async sendCoins(
      { dispatch, commit, state },
      { receiver, amount, denom, password }
    ) {
      await dispatch(`sendTx`, {
        type: `send`,
        password,
        to: receiver,
        amount: [{ denom, amount: amount.toString() }]
      })

      const oldBalance = state.balances.find(balance => balance.denom === denom)
      commit(`updateWalletBalance`, {
        denom,
        amount: oldBalance.amount - amount
      })
    },
    async loadDenoms({ commit, state }) {
      try {
        const { genesis } = await network()

        let denoms = []
        for (let account of genesis.app_state.accounts) {
          if (account.coins) {
            for (let { denom } of account.coins) {
              denoms.push(denom)
            }
          }
        }

        commit(`setDenoms`, denoms)
      } catch (err) {
        state.error = err
      }
    },
    queryWalletStateAfterHeight({ rootState, dispatch }, height) {
      return new Promise(resolve => {
        // wait until height is >= `height`
        let interval = setInterval(() => {
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
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
