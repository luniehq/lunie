import Vue from "vue"
import Vuex from "vuex"
import CryptoJS from "crypto-js"
import _ from "lodash"
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
          _.merge(state, oldState, {
            wallet: {
              historyLoading: false,
              balancesLoading: false
            },
            delegates: {
              loading: false
            }
          })
          this.replaceState(state)
        }

        state.user.stateLoaded = true
      }
    }
  })

  store.subscribe((mutation, state) => {
    // if the user is logged in cache the balances and the tx-history for that user
    // skip persisting the state before the potentially persisted state has been loaded
    if (state.user.stateLoaded && state.user.account && state.user.password) {
      persistState(state)
    }
  })

  return store
}

function persistState(state) {
  const encryptedState = CryptoJS.AES.encrypt(
    JSON.stringify({
      wallet: {
        history: state.wallet.history,
        balances: state.wallet.balances
      },
      delegation: {
        committedDelegates: state.delegation.committedDelegates
      },
      delegates: {
        delegates: state.delegates.delegates
      }
    }),
    state.user.password
  )
  // Store the state object as a JSON string
  localStorage.setItem("store_" + state.user.account, encryptedState)
}

function loadPersistedState(state, { account, password }) {
  const cachedState = localStorage.getItem("store_" + account)
  if (cachedState) {
    const bytes = CryptoJS.AES.decrypt(cachedState, password)
    const plaintext = bytes.toString(CryptoJS.enc.Utf8)

    // Replace the state object with the stored state
    let oldState = JSON.parse(plaintext)
    _.merge(state, oldState, {
      // set loading indicators to false
      wallet: {
        historyLoading: false,
        balancesLoading: false
      },
      delegates: {
        loading: false
      }
    })
    this.replaceState(state)
  }

  state.user.stateLoaded = true
}
