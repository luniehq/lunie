import Vue from "vue"
import Vuex from "vuex"
import CryptoJS from "crypto-js"
import * as getters from "./getters"
import modules from "./modules"

Vue.use(Vuex)

export default (opts = {}) => {
  opts.commit = (...args) => store.commit(...args)
  opts.dispatch = (...args) => store.dispatch(...args)
  var store = new Vuex.Store({
    getters,
    // strict: true,
    modules: modules(opts),
    mutations: {
      loadPersistedState(state, { account, password }) {
        const cachedState = localStorage.getItem("store_" + account)
        if (cachedState) {
          const bytes = CryptoJS.AES.decrypt(cachedState, password)
          const plaintext = bytes.toString(CryptoJS.enc.Utf8)

          // Replace the state object with the stored item
          // Object.assign does no deep assign :/
          let oldState = JSON.parse(plaintext)
          state.wallet.history = oldState.wallet.history
          state.wallet.historyLoading = false
          state.wallet.balances = oldState.wallet.balances
          state.wallet.balancesLoading = false
          state.delegation.committedDelegates =
            oldState.delegation.committedDelegates
          this.replaceState(state)
        }

        state.user.stateLoaded = true
      }
    }
  })

  // if the user is logged in cache the balances and the tx-history for that user
  store.subscribe((mutation, state) => {
    if (state.user.stateLoaded && state.user.account && state.user.password) {
      const encryptedState = CryptoJS.AES.encrypt(
        JSON.stringify({
          wallet: {
            history: state.wallet.history,
            balances: state.wallet.balances
          },
          delegation: {
            committedDelegates: state.delegation.committedDelegates
          }
        }),
        state.user.password
      )
      // Store the state object as a JSON string
      localStorage.setItem("store_" + state.user.account, encryptedState)
    }
  })

  return store
}
