import * as Sentry from "@sentry/browser"
import noScroll from "no-scroll"
import {
  enableGoogleAnalytics,
  disableGoogleAnalytics,
  track
} from "../../google-analytics.js"
import config from "../../../config"
import { loadKeys, importKey, testPassword } from "../../scripts/keystore.js"
import { generateSeed } from "../../scripts/wallet.js"

export default () => {
  const ERROR_COLLECTION_KEY = `voyager_error_collection`

  const state = {
    experimentalMode: config.development,
    insecureMode: config.development,
    signedIn: false,
    accounts: [],
    localKeyPairName: null, // used for signing with a locally stored key, TODO move into own module
    pauseHistory: false,
    history: [],
    address: null,
    errorCollection: false,
    stateLoaded: false, // shows if the persisted state is already loaded. used to prevent overwriting the persisted state before it is loaded
    error: null,
    modals: {
      error: { active: false },
      help: { active: false },
      session: {
        active: false,
        state: `loading`
      }
    },

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
    setModalHelp(state, value) {
      if (value) {
        state.externals.track(`event`, `modal`, `help`)
      }

      state.modals.help.active = value
    },
    setExperimentalMode(state) {
      state.experimentalMode = true
    },
    setInsecureMode(state) {
      state.insecureMode = true
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
    },
    toggleSessionModal(state, value) {
      // reset modal signin state if we're closing the modal
      if (value) {
        noScroll.on()
      } else {
        state.modals.session.state = `loading`
        noScroll.off()
      }
      state.modals.session.active = value
    },
    setSessionModalView(state, value) {
      state.modals.session.state = value
    }
  }

  const actions = {
    async reconnected({ dispatch }) {
      // reload available accounts as the reconnect could be a result of a switch from a mocked connection with mocked accounts
      await dispatch(`loadAccounts`)
    },
    async showInitialScreen({ state, dispatch }) {
      dispatch(`resetSessionData`)
      await dispatch(`loadAccounts`)
      state.externals.track(`pageview`, { dl: `/` })
    },
    async loadAccounts({ commit, state }) {
      state.loading = true
      try {
        const keys = await state.externals.loadKeys()
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
    async testLogin(store, { password, localKeyPairName }) {
      return await testPassword(localKeyPairName, password)
    },
    createSeed() {
      return state.externals.generateSeed()
    },
    async createKey({ dispatch, state }, { seedPhrase, password, name }) {
      state.externals.track(`event`, `session`, `create-keypair`)

      const { cosmosAddress } = await state.externals.importKey(
        name,
        password,
        seedPhrase
      )
      await dispatch(`initializeWallet`, { address: cosmosAddress })
      return cosmosAddress
    },
    // TODO split into sign in with ledger and signin with local key
    async signIn(
      { state, commit, dispatch },
      { localKeyPairName, address, sessionType = `local`, errorCollection = false }
    ) {
      let accountAddress
      switch (sessionType) {
        case `ledger`:
          accountAddress = address
          break
        default:
          // local keyStore
          state.localKeyPairName = localKeyPairName
          accountAddress = (await state.externals.loadKeys()).find(({ name }) => name === localKeyPairName).address
      }
      commit(`setSignIn`, true)
      dispatch(`setErrorCollection`, {
        account: accountAddress,
        optin: errorCollection
      })
      commit(`setUserAddress`, accountAddress)
      dispatch(`loadPersistedState`)
      commit(`toggleSessionModal`, false)
      await dispatch(`getStakingParameters`)
      await dispatch(`getGovParameters`)
      dispatch(`loadErrorCollection`, accountAddress)
      await dispatch(`initializeWallet`, { address: accountAddress })

      state.externals.track(`event`, `session`, `sign-in`, sessionType)
    },
    signOut({ state, commit, dispatch }) {
      state.externals.track(`event`, `session`, `sign-out`)

      state.localKeyPairName = null
      commit(`setLedgerConnection`, false)
      commit(`setCosmosAppVersion`, {})
      dispatch(`resetSessionData`)
      commit(`addHistory`, `/`)
      commit(`setSignIn`, false)
    },
    resetSessionData({ commit, state }) {
      state.history = []
      state.localKeyPairName = null
      commit(`setUserAddress`, null)
    },
    loadErrorCollection({ state, dispatch }, address) {
      const errorCollection =
        localStorage.getItem(`${ERROR_COLLECTION_KEY}_${address}`) === `true`
      if (state.errorCollection !== errorCollection)
        dispatch(`setErrorCollection`, { address, optin: errorCollection })
    },
    setErrorCollection({ state, commit }, { address, optin }) {
      if (
        optin &&
        state.externals.config.development
      ) {
        commit(`notifyError`, {
          title: `Couldn't switch on error collection.`,
          body: `Error collection is disabled during development.`
        })
      }
      state.errorCollection = state.externals.config.development ? false : optin
      localStorage.setItem(
        `${ERROR_COLLECTION_KEY}_${address}`,
        state.errorCollection
      )

      if (state.errorCollection) {
        state.externals.Sentry.init({
          dsn: state.externals.config.sentry_dsn,
          release: state.externals.config.version
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
