import * as Sentry from "@sentry/browser"
import {
  enableGoogleAnalytics,
  disableGoogleAnalytics,
  track
} from "../../google-analytics.js"
const config = require(`../../../config.json`)
import { loadKeys, importKey, testPassword } from "../../scripts/keystore.js"
import { generateSeed } from "../../scripts/wallet.js"
import CryptoJS from "crypto-js"

export default ({}) => {
  const ERROR_COLLECTION_KEY = `voyager_error_collection`

  let state = {
    atoms: 0,
    signedIn: false,
    accounts: [],
    pauseHistory: false,
    history: [],
    account: null,
    address: null,
    errorCollection: false,
    stateLoaded: false, // shows if the persisted state is already loaded. used to prevent overwriting the persisted state before it is loaded
    error: null,

    // import into state to be able to test easier
    externals: {
      config,
      loadKeys,
      importKey,
      testPassword,
      generateSeed,
      enableGoogleAnalytics,
      disableGoogleAnalytics,
      track,
      Sentry
    }
  }

  const mutations = {
    setAccounts(state, accounts) {
      state.accounts = accounts
    },
    setAtoms(state, atoms) {
      state.atoms = atoms
    },
    addHistory(state, path) {
      state.history.push(path)
      state.externals.track(`pageview`, {
        dl: path
      })
    },
    popHistory(state) {
      state.history.pop()
    },
    pauseHistory(state, paused) {
      state.pauseHistory = paused
    }
  }

  const actions = {
    async reconnected({ dispatch }) {
      // reload available accounts as the reconnect could be a result of a switch from a mocked connection with mocked accounts
      await dispatch(`loadAccounts`)
    },
    async showInitialScreen({ state, dispatch, commit }) {
      dispatch(`resetSessionData`)

      await dispatch(`loadAccounts`)
      let exists = state.accounts.length > 0
      let screen = exists ? `sign-in` : `welcome`
      commit(`setModalSessionState`, screen)

      state.externals.track(`pageview`, {
        dl: `/session/` + screen
      })
    },
    async loadAccounts({ commit, state }) {
      state.loading = true
      try {
        let keys = await state.externals.loadKeys()
        commit(`setAccounts`, keys)
      } catch (error) {
        state.externals.Sentry.captureException(error)
        commit(`notifyError`, {
          title: `Couldn't read keys`,
          body: error.message
        })
        state.error = error
      } finally {
        state.loading = false
      }
    },
    async testLogin({}, { password, account }) {
      return await testPassword(account, password)
    },
    createSeed() {
      return state.externals.generateSeed(x =>
        CryptoJS.lib.WordArray.random(x).toString()
      )
    },
    async createKey({ dispatch }, { seedPhrase, password, name }) {
      let { address } = await state.externals.importKey(
        name,
        password,
        seedPhrase
      )
      dispatch(`initializeWallet`, address)
      return address
    },
    async signIn({ state, commit, dispatch }, { account }) {
      state.account = account
      state.signedIn = true

      let keys = await state.externals.loadKeys()
      let { address } = keys.find(({ name }) => name === account)

      state.address = address

      dispatch(`loadPersistedState`)
      commit(`setModalSession`, false)
      await dispatch(`getStakingParameters`)
      dispatch(`initializeWallet`, address)
      await dispatch(`getGovParameters`)
      dispatch(`loadErrorCollection`, account)
    },
    signOut({ state, commit, dispatch }) {
      state.account = null
      state.signedIn = false

      commit(`setModalSession`, true)
      dispatch(`showInitialScreen`)
    },
    resetSessionData({ state }) {
      state.atoms = 0
      state.history = []
      state.account = null
      state.address = null
    },
    loadErrorCollection({ state, dispatch }, account) {
      let errorCollection =
        localStorage.getItem(`${ERROR_COLLECTION_KEY}_${account}`) === `true`
      if (state.errorCollection !== errorCollection)
        dispatch(`setErrorCollection`, { account, optin: errorCollection })
    },
    setErrorCollection({ state, commit }, { account, optin }) {
      if (
        optin &&
        state.errorCollection === false &&
        state.externals.config.development
      ) {
        commit(`notifyError`, {
          title: `Couldn't switch on error collection.`,
          body: `Error collection is disabled during development.`
        })
      }
      state.errorCollection = state.externals.config.development ? false : optin
      localStorage.setItem(
        `${ERROR_COLLECTION_KEY}_${account}`,
        state.errorCollection
      )

      if (state.errorCollection) {
        state.externals.Sentry.init({
          dsn: config.sentry_dsn,
          release: `voyager@${state.externals.config.version}`
        })
        state.externals.enableGoogleAnalytics(
          state.externals.config.google_analytics_uid
        )
        console.log(`Analytics and error reporting have been enabled`)
        state.externals.track(`pageview`, {
          dl: window.location.pathname
        })
      } else {
        console.log(`Analytics disabled in browser`)
        state.externals.Sentry.init({})
        state.externals.disableGoogleAnalytics(
          state.externals.config.google_analytics_uid
        )
      }
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
