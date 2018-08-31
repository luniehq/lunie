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
      loadPersistedState
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
      transactions: {
        wallet: state.transactions.wallet,
        staking: state.transactions.staking
      },
      wallet: {
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
  localStorage.setItem(getStorageKey(state), encryptedState)
}

function getStorageKey(state) {
  const chainId = state.node.lastHeader.chain_id
  const address = state.user.address
  return `store_${chainId}_${address}`
}

function loadPersistedState(state, { password }) {
  const cachedState = localStorage.getItem(getStorageKey(state))
  if (cachedState) {
    const bytes = CryptoJS.AES.decrypt(cachedState, password)
    const plaintext = bytes.toString(CryptoJS.enc.Utf8)

    // Replace the state object with the stored state
    let oldState = JSON.parse(plaintext)
    _.merge(state, oldState, {
      // set loading indicators to false
      transactions: {
        loading: false
      },
      wallet: {
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
