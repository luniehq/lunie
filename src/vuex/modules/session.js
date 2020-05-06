import { track, deanonymize, anonymize } from "scripts/google-analytics"
import pushNotifications from "./pushNotifications.js"
import config from "src/../config"

export default ({ apollo }) => {
  const USER_PREFERENCES_KEY = `lunie_user_preferences`

  const state = {
    developmentMode: config.development, // can't be set in browser
    experimentalMode: config.development, // development mode, can be set from browser
    insecureMode: config.development || config.e2e || false, // show the local signer
    mobile: config.mobileApp || false,
    signedIn: false,
    sessionType: null, // local, explore, ledger, extension
    pauseHistory: false,
    history: [],
    address: null, // Current address
    addresses: [], // Array of previously used addresses
    errorCollection: false,
    analyticsCollection: false,
    cookiesAccepted: undefined,
    stateLoaded: false, // shows if the persisted state is already loaded. used to prevent overwriting the persisted state before it is loaded
    error: null,
    currrentModalOpen: false,
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
      deanonymize
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
    setUserAddresses(state, addresses) {
      state.addresses = addresses
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
    setCurrrentModalOpen(state, modal) {
      state.currrentModalOpen = modal
    }
  }

  const actions = {
    async checkForPersistedSession({
      dispatch,
      commit,
      rootState: {
        connection: { network }
      }
    }) {
      const session = localStorage.getItem(sessionKey(network))
      if (session) {
        const { address, sessionType } = JSON.parse(session)
        await dispatch(`signIn`, { address, sessionType, networkId: network })
      } else {
        commit(`setSignIn`, false)
      }
    },
    async checkForPersistedAddresses({ commit }) {
      const addresses = localStorage.getItem(`addresses`)
      if (addresses) {
        await commit(`setUserAddresses`, JSON.parse(addresses))
      }
    },
    async persistSession(store, { address, sessionType, networkId }) {
      localStorage.setItem(
        sessionKey(networkId),
        JSON.stringify({ address, sessionType })
      )
    },
    async persistAddresses(store, { addresses }) {
      localStorage.setItem(`addresses`, JSON.stringify(addresses))
    },
    async rememberAddress(
      { state, commit },
      { address, sessionType, networkId }
    ) {
      // Check if signin address was previously used
      const sessionExist = state.addresses.find(
        usedAddress => address === usedAddress.address
      )
      // Add signin address to addresses array if was not used previously
      if (!sessionExist) {
        state.addresses.push({
          address,
          type: sessionType,
          networkId
        })
        commit(`setUserAddresses`, state.addresses)
      }
    },
    async signIn(
      {
        state,
        getters: { networks },
        commit,
        dispatch,
        rootState: {
          connection: { network }
        }
      },
      { address, sessionType = `ledger`, networkId }
    ) {
      if (networkId && network !== networkId) {
        await commit(`setNetworkId`, networkId)
        await dispatch(`persistNetwork`, { id: networkId })
        network = networkId
      }
      commit(`setSignIn`, true)
      commit(`setSessionType`, sessionType)
      commit(`setUserAddress`, address)
      await dispatch(`rememberAddress`, { address, sessionType, networkId })

      dispatch(`persistSession`, {
        address,
        sessionType,
        networkId: network
      })
      const addresses = state.addresses
      dispatch(`persistAddresses`, {
        addresses
      })

      // Register device for push registrations
      const activeNetworks = getActiveNetworks(networks)
      /* istanbul ignore next */
      await pushNotifications.askPermissionAndRegister(activeNetworks, apollo)

      state.externals.track(`event`, `session`, `sign-in`, sessionType)
    },
    signOut({ state, commit, dispatch }, networkId) {
      state.externals.track(`event`, `session`, `sign-out`)

      dispatch(`resetSessionData`, networkId)
      commit(`setSignIn`, false)
    },
    resetSessionData({ commit, state }, networkId) {
      state.history = ["/"]
      commit(`setUserAddress`, null)
      localStorage.removeItem(sessionKey(networkId))
    },
    loadLocalPreferences({ state, dispatch }) {
      const localPreferences = localStorage.getItem(USER_PREFERENCES_KEY)

      // don't track in development
      if (state.developmentMode) return

      if (!localPreferences) {
        state.cookiesAccepted = false
        return
      }

      const {
        cookiesAccepted,
        errorCollection,
        analyticsCollection
      } = JSON.parse(localPreferences)

      if (cookiesAccepted) {
        state.cookiesAccepted = true
      }
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
          cookiesAccepted: state.cookiesAccepted,
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

/**
 * Retrieve active networks from localstorage via session keys
 */
const getActiveNetworks = networkObjects => {
  let activeNetworks = []
  networkObjects.forEach(network => {
    // Session object: { address: string, sessionType: string (e.g. ledger)}
    const networkObject = JSON.parse(
      localStorage.getItem(`session_${network.id}`)
    )

    // Only store network object if it has an associated address
    if (networkObject) {
      activeNetworks.push({
        address: networkObject.address,
        networkId: network.id
      })
    }
  })

  return activeNetworks
}

function sessionKey(networkId) {
  return `session_${networkId}`
}
