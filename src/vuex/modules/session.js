import * as Sentry from "@sentry/browser"
import { track, deanonymize, anonymize } from "scripts/google-analytics.js"
import config from "src/config"
import { loadKeys, importKey, testPassword } from "../../scripts/keystore.js"
import { getSeed } from "@lunie/cosmos-keys"

export default () => {
  const USER_PREFERENCES_KEY = `lunie_user_preferences`

  const state = {
    developmentMode: config.development, // can't be set in browser
    experimentalMode: config.development, // development mode, can be set from browser
    insecureMode: false, // show the local signer
    signedIn: false,
    sessionType: null, // local, ledger
    extensionInstalled: false,
    accounts: [],
    localKeyPairName: null, // used for signing with a locally stored key; TODO: move into own module
    pauseHistory: false,
    history: [],
    address: null,
    errorCollection: false,
    analyticsCollection: false,
    cookiesAccepted: undefined,
    stateLoaded: false, // shows if the persisted state is already loaded. used to prevent overwriting the persisted state before it is loaded
    error: null,
    maintenanceBar: false,
    modals: {
      error: { active: false },
      help: { active: false },
      session: {
        active: false,
        state: `welcome`
      }
    },
    browserWithLedgerSupport:
      navigator.userAgent.includes(`Chrome`) ||
      navigator.userAgent.includes(`Opera`),

    // import into state to be able to test easier
    externals: {
      config,
      loadKeys,
      importKey,
      testPassword,
      getSeed,
      track,
      anonymize,
      deanonymize,
      Sentry
    }
  }

  const mutations = {
    setSignIn(state, hasSignedIn) {
      state.signedIn = hasSignedIn
    },
    setSessionType(state, sessionType) {
      state.sessionType = sessionType
    },
    setAccounts(state, accounts) {
      state.accounts = accounts
    },
    setUserAddress(state, address) {
      state.address = address
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
      state.modals.session.active = value
    },
    setSessionModalView(state, value) {
      state.modals.session.state = value
    },
    setExtensionInstalled(state, installed) {
      state.extensionInstalled = installed
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
    async checkForPersistedSession({ dispatch }) {
      const session = localStorage.getItem(`session`)
      if (session) {
        const { localKeyPairName, address, sessionType } = JSON.parse(session)
        dispatch(`signIn`, { localKeyPairName, address, sessionType })
      }
    },
    async persistSession(store, { localKeyPairName, address, sessionType }) {
      localStorage.setItem(
        `session`,
        JSON.stringify({ localKeyPairName, address, sessionType })
      )
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
      return state.externals.getSeed()
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
      { localKeyPairName, address, sessionType = `ledger` }
    ) {
      let accountAddress
      switch (sessionType) {
        case `ledger`:
        case `explore`:
          accountAddress = address
          break
        default:
          // local keyStore
          state.localKeyPairName = localKeyPairName
          accountAddress = await getLocalAddress(state, localKeyPairName)
      }
      commit(`setSignIn`, true)
      commit(`setSessionType`, sessionType)
      commit(`setUserAddress`, accountAddress)
      await dispatch(`loadPersistedState`)
      commit(`toggleSessionModal`, false)
      await dispatch(`initializeWallet`, { address: accountAddress })
      dispatch(`persistSession`, {
        localKeyPairName,
        address: accountAddress,
        sessionType
      })

      state.externals.track(`event`, `session`, `sign-in`, sessionType)
    },
    signOut({ state, commit, dispatch }) {
      state.externals.track(`event`, `session`, `sign-out`)

      state.localKeyPairName = null
      dispatch(`resetSessionData`)
      commit(`addHistory`, `/`)
      commit(`setSignIn`, false)
      localStorage.removeItem(`session`)
    },
    resetSessionData({ commit, state }) {
      state.history = []
      state.localKeyPairName = null
      commit(`setUserAddress`, null)
    },
    loadLocalPreferences({ state, dispatch }) {
      const localPreferences = localStorage.getItem(USER_PREFERENCES_KEY)

      // don't track in development
      if (state.developmentMode) return

      if (!localPreferences) {
        state.cookiesAccepted = false
        return
      }
      state.cookiesAccepted = true

      const { errorCollection, analyticsCollection } = JSON.parse(
        localPreferences
      )
      if (state.errorCollection !== errorCollection)
        dispatch(`setErrorCollection`, errorCollection)
      if (state.analyticsCollection !== analyticsCollection)
        dispatch(`setAnalyticsCollection`, analyticsCollection)
    },
    storeLocalPreferences({ state }) {
      state.cookiesAccepted = true
      localStorage.setItem(
        USER_PREFERENCES_KEY,
        JSON.stringify({
          errorCollection: state.errorCollection,
          analyticsCollection: state.analyticsCollection
        })
      )
    },
    setErrorCollection({ state, dispatch }, enabled) {
      // don't track in development
      if (state.developmentMode) return

      state.errorCollection = enabled
      dispatch(`storeLocalPreferences`)

      if (state.errorCollection && !state.externals.config.development) {
        state.externals.Sentry.init({
          dsn: state.externals.config.sentry_dsn,
          release: state.externals.config.version
        })
        console.log(`Error collection has been enabled`)
      } else {
        console.log(`Error collection has been disabled`)
        state.externals.Sentry.init({})
      }
    },
    setAnalyticsCollection({ state, dispatch }, enabled) {
      // don't track in development
      if (state.developmentMode) return

      state.analyticsCollection = enabled
      dispatch(`storeLocalPreferences`)

      if (state.analyticsCollection) {
        state.externals.deanonymize()
        console.log(`Analytics collection has been enabled`)
      } else {
        state.externals.anonymize()
        console.log(`Analytics collection has been disabled`)
      }
    },
    setExtensionStatus({ commit }, status) {
      commit(`setExtensionInstalled`, status)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}

async function getLocalAddress(state, localKeyPairName) {
  return (await state.externals.loadKeys()).find(
    ({ name }) => name === localKeyPairName
  ).address
}
