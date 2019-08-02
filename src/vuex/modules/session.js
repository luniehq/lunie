import * as Sentry from "@sentry/browser"
import { track, deanonymize, anonymize } from "scripts/google-analytics.js"
import config from "src/config"

export default () => {
  const USER_PREFERENCES_KEY = `lunie_user_preferences`

  const state = {
    developmentMode: config.development, // can't be set in browser
    experimentalMode: config.development, // development mode, can be set from browser
    insecureMode: false, // show the local signer
    signedIn: false,
    sessionType: null, // local, ledger, extension
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
      help: { active: false }
    },
    browserWithLedgerSupport:
      navigator.userAgent.includes(`Chrome`) ||
      navigator.userAgent.includes(`Opera`),

    // import into state to be able to test easier
    externals: {
      config,
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
    }
  }

  const actions = {
    async checkForPersistedSession({ dispatch }) {
      const session = localStorage.getItem(`session`)
      if (session) {
        const { address, sessionType } = JSON.parse(session)
        dispatch(`signIn`, { address, sessionType })
      }
    },
    async persistSession(store, { address, sessionType }) {
      localStorage.setItem(`session`, JSON.stringify({ address, sessionType }))
    },
    async signIn(
      { state, commit, dispatch },
      { address, sessionType = `ledger` }
    ) {
      if (state.signedIn) {
        await dispatch(`resetSessionData`)
      }

      commit(`setSignIn`, true)
      commit(`setSessionType`, sessionType)
      commit(`setUserAddress`, address)
      await dispatch(`loadPersistedState`)
      await dispatch(`initializeWallet`, { address })
      dispatch(`persistSession`, {
        address,
        sessionType
      })

      state.externals.track(`event`, `session`, `sign-in`, sessionType)
    },
    signOut({ state, commit, dispatch }) {
      state.externals.track(`event`, `session`, `sign-out`)

      dispatch(`resetSessionData`)
      commit(`setSignIn`, false)
    },
    resetSessionData({ commit, state }) {
      state.history = ["/"]
      commit(`setUserAddress`, null)
      localStorage.removeItem(`session`)
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
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
