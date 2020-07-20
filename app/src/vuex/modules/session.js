import { track, deanonymize, anonymize } from "scripts/google-analytics"
// import pushNotifications from "./pushNotifications.js"
import config from "src/../config"
import { AddressRole } from "../../gql"

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
    allSessionAddresses: [],
    addressRole: undefined, // Polkadot: 'stash/controller', 'stash', 'controller' or 'none'
    errorCollection: false,
    analyticsCollection: false,
    cookiesAccepted: undefined,
    preferredCurrency: undefined,
    notificationAvailable: false,
    stateLoaded: false, // shows if the persisted state is already loaded. used to prevent overwriting the persisted state before it is loaded
    error: null,
    currrentModalOpen: false,
    modals: {
      error: { active: false },
      help: { active: false },
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
    },
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
    setAllSessionAddresses(state, addresses) {
      state.allSessionAddresses = addresses
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
        dl: path,
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
    },
    setUserAddressRole(state, addressRole) {
      state.addressRole = addressRole
    },
  }

  const actions = {
    async checkForPersistedSession({
      dispatch,
      commit,
      rootState: {
        connection: { network },
      },
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
        (usedAddress) => address === usedAddress.address
      )
      // Add signin address to addresses array if was not used previously
      if (!sessionExist) {
        state.addresses.push({
          address,
          type: sessionType,
          networkId,
        })
        commit(`setUserAddresses`, state.addresses)
      }
    },
    async signIn(
      { state, getters: { currentNetwork }, commit, dispatch },
      { address, sessionType = `ledger`, networkId }
    ) {
      if (networkId && currentNetwork.id !== networkId) {
        await commit(`setNetworkId`, networkId)
        await dispatch(`persistNetwork`, { id: networkId })
      }
      commit(`setSignIn`, true)
      commit(`setSessionType`, sessionType)
      commit(`setUserAddress`, address)
      await dispatch(`rememberAddress`, { address, sessionType, networkId })

      dispatch(`persistSession`, {
        address,
        sessionType,
        networkId,
      })
      const addresses = state.addresses
      dispatch(`persistAddresses`, {
        addresses,
      })

      // In Polkadot there are different account types for staking. To be able to signal allowed interactions
      // for the user in Lunie we need to query for the type of the account.
      if (currentNetwork.network_type === "polkadot") {
        await dispatch(`checkAddressRole`, {
          address,
          networkId: currentNetwork.id,
        })
      } else {
        commit(`setUserAddressRole`, undefined)
      }

      // update session addresses
      const allSessionAddresses = await dispatch("getAllSessionAddresses")
      commit("setAllSessionAddresses", allSessionAddresses)

      // TODO
      // Register device for push registrations
      // const activeNetworks = getActiveNetworks(networks)
      // await pushNotifications.askPermissionAndRegister(activeNetworks, apollo)
      // update registered topics for emails
      dispatch("updateEmailRegistrations")

      state.externals.track(`event`, `session`, `sign-in`, sessionType)
    },
    async signOut({ state, commit, dispatch }, networkId) {
      state.externals.track(`event`, `session`, `sign-out`)

      dispatch(`resetSessionData`, networkId)
      commit(`setSignIn`, false)

      // update session addresses
      const allSessionAddresses = await dispatch("getAllSessionAddresses")
      commit("setAllSessionAddresses", allSessionAddresses)

      // update registered topics for emails
      dispatch("updateEmailRegistrations")
    },
    resetSessionData({ commit, state }, networkId) {
      state.history = ["/"]
      commit(`setUserAddress`, null)
      localStorage.removeItem(sessionKey(networkId))
    },
    loadLocalPreferences({ state, dispatch }) {
      const localPreferences = localStorage.getItem(USER_PREFERENCES_KEY)

      if (!localPreferences) {
        state.cookiesAccepted = false
        return
      }

      const {
        cookiesAccepted,
        errorCollection,
        analyticsCollection,
        preferredCurrency,
      } = JSON.parse(localPreferences)

      if (cookiesAccepted) {
        state.cookiesAccepted = true
      }
      if (state.errorCollection !== errorCollection)
        dispatch(`setErrorCollection`, errorCollection)
      if (state.analyticsCollection !== analyticsCollection)
        dispatch(`setAnalyticsCollection`, analyticsCollection)
      if (state.preferredCurrency !== preferredCurrency)
        dispatch(`setPreferredCurrency`, preferredCurrency)
    },
    storeLocalPreferences({ state }) {
      state.cookiesAccepted = true
      localStorage.setItem(
        USER_PREFERENCES_KEY,
        JSON.stringify({
          cookiesAccepted: state.cookiesAccepted,
          errorCollection: state.errorCollection,
          analyticsCollection: state.analyticsCollection,
          preferredCurrency: state.preferredCurrency,
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
    },
    setPreferredCurrency({ state, dispatch }, currency) {
      state.preferredCurrency = currency
      dispatch(`storeLocalPreferences`)
    },
    /* istanbul ignore next */
    async checkAddressRole({ commit }, { address, networkId }) {
      const { data } = await apollo.query({
        query: AddressRole,
        variables: { networkId, address },
        fetchPolicy: "network-only",
      })
      commit(`setUserAddressRole`, data.accountRole)
    },
    async getAllSessionAddresses({
      rootState: {
        connection: { networks },
      },
    }) {
      let allSessionAddresses = []
      networks.forEach((network) => {
        const sessionEntry = localStorage.getItem(`session_${network.id}`)
        if (!sessionEntry) return []

        const networkId = network.id
        const icon = network.icon
        const title = network.title

        allSessionAddresses.push({
          networkId,
          icon,
          title,
          address: JSON.parse(sessionEntry).address,
          sessionType: JSON.parse(sessionEntry).sessionType,
        })
      })
      return allSessionAddresses
    },
    setNotificationAvailable(store, { notificationAvailable }) {
      state.notificationAvailable = notificationAvailable
    },
  }

  return {
    state,
    mutations,
    actions,
  }
}

/**
 * Retrieve active networks from localstorage via session keys
 */
// const getActiveNetworks = networkObjects => {
//   let activeNetworks = []
//   networkObjects.forEach(network => {
//     // Session object: { address: string, sessionType: string (e.g. ledger)}
//     const networkObject = JSON.parse(
//       localStorage.getItem(`session_${network.id}`)
//     )

//     // Only store network object if it has an associated address
//     if (networkObject) {
//       activeNetworks.push({
//         address: networkObject.address,
//         networkId: network.id
//       })
//     }
//   })

//   return activeNetworks
// }

function sessionKey(networkId) {
  return `session_${networkId}`
}
