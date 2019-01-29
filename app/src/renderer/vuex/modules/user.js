import * as Sentry from "@sentry/browser"
import {
  enableGoogleAnalytics,
  disableGoogleAnalytics,
  track
} from "../../google-analytics.js"
const config = require(`../../../config.json`)
import { loadKeys, importKey, testPassword } from "../../scripts/keystore.js"
import { generateSeed } from "../../scripts/wallet.js"

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
    setSignIn(state, hasSignedIn) {
      state.signedIn = hasSignedIn
    },
    setAccounts(state, accounts) {
      state.accounts = accounts
    },
    setUserAddress(state, address) {
      state.address = address
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
      commit(`setModalSessionState`, `welcome`)

      state.externals.track(`pageview`, {
        dl: `/session/welcome`
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
      return state.externals.generateSeed()
    },
    async createKey({ dispatch }, { seedPhrase, password, name }) {
      let { address } = await state.externals.importKey(
        name,
        password,
        seedPhrase
      )
      await dispatch(`initializeWallet`, address)
      return address
    },
    async signIn(
      { state, commit, dispatch },
      { account, address, sessionType = `local`, setUserAccount = true }
    ) {
      let accountAddress
      switch (sessionType) {
        case `ledger`:
          accountAddress = address
          break
        default:
          // local keyStore
          state.account = account // TODO: why do we have state.account and state.accounts ??
          let keys = await state.externals.loadKeys()
          accountAddress = keys.find(({ name }) => name === account).address
      }
      commit(`setSignIn`, true)
      console.log(accountAddress)
      if (setUserAccount) {
        commit(`setUserAddress`, accountAddress)
        dispatch(`loadPersistedState`)
        commit(`setModalSession`, false)
        await dispatch(`getStakingParameters`)
        await dispatch(`getGovParameters`)
        dispatch(`loadErrorCollection`, accountAddress)
      }
      await dispatch(`initializeWallet`, { address: accountAddress })
    },
    signOut({ state, commit, dispatch }) {
      state.account = null
      commit(`setSignIn`, false)
      commit(`setModalSession`, true)
      commit(`setLedgerConnection`, false)
      commit(`setLedgerCosmosVersion`, {})
      dispatch(`showInitialScreen`)
    },
    resetSessionData({ commit, state }) {
      state.atoms = 0
      state.history = []
      state.account = null
      commit(`setUserAddress`, null)
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
