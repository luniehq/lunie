import { track, deanonymize, anonymize } from "scripts/google-analytics"
import * as Sentry from "@sentry/browser"
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
    HDPath: undefined,
    curve: undefined,
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
    userAccounts: [],
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
    updateField(state, payload) {
      state[payload.field] = payload.value
    },
    setSignIn(state, hasSignedIn) {
      state.signedIn = hasSignedIn
    },
    setSessionType(state, sessionType) {
      state.sessionType = sessionType
    },
    setHDPath(state, HDPath) {
      state.HDPath = HDPath
    },
    setCurve(state, curve) {
      state.curve = curve
    },
    setUserAddress(state, address) {
      state.address = address
    },
    setUserAddresses(state, addresses) {
      state.addresses = addresses.map((address) => {
        let storedAddress = {
          ...address,
          sessionType: address.sessionType || address.type,
        }
        delete storedAddress.type
        return storedAddress
      })
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
    setUserAccounts(state, accounts) {
      state.userAccounts = accounts
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
        const { address, sessionType, HDPath, curve } = JSON.parse(session)
        await dispatch(`signIn`, {
          address,
          sessionType,
          HDPath,
          curve,
          networkId: network,
        })
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
    async persistSession(
      store,
      { address, sessionType, HDPath, curve, networkId }
    ) {
      localStorage.setItem(
        sessionKey(networkId),
        JSON.stringify({ address, sessionType, HDPath, curve })
      )
    },
    async persistAddresses(store, addresses) {
      localStorage.setItem(`addresses`, JSON.stringify(addresses))
    },
    async rememberAddress(
      { state, commit },
      { address, name, sessionType, networkId, HDPath, curve }
    ) {
      // Check if signin address was previously used
      const sessionExist = state.addresses.find(
        (usedAddress) => address === usedAddress.address
      )
      // Add signin address to addresses array if was not used previously
      if (!sessionExist) {
        state.addresses.push({
          address,
          name,
          sessionType,
          networkId,
          HDPath,
          curve,
        })
        commit(`setUserAddresses`, state.addresses)
      }
    },
    async signIn(
      {
        state,
        rootState: {
          connection: { networks },
        },
        commit,
        dispatch,
      },
      { address, sessionType = `ledger`, HDPath, curve, networkId }
    ) {
      Sentry.setContext("network", networkId)
      Sentry.setContext("address", address)
      const currentNetwork = networks.find(({ id }) => id === networkId)
      // first search in localStorage for the curve and derivation path
      const session = JSON.parse(
        localStorage.getItem(`cosmos-wallets-${address}`)
      )
      const finalCrypto = handleSessionCrypto({
        HDPath,
        curve,
        address,
        session,
        currentNetwork,
      })
      // override crypto with right HDPath and curve
      HDPath = finalCrypto.HDPath
      curve = finalCrypto.curve
      if (networkId && currentNetwork) {
        await commit(`setNetworkId`, networkId)
        await dispatch(`persistNetwork`, { id: networkId })
      }
      commit(`setSignIn`, true)
      commit(`setSessionType`, sessionType)
      commit(`setHDPath`, HDPath)
      commit(`setCurve`, curve)
      commit(`setUserAddress`, address)
      await dispatch(`rememberAddress`, {
        address,
        sessionType,
        name: session ? session.name : undefined,
        HDPath,
        curve,
        networkId,
      })

      dispatch(`persistSession`, {
        address,
        sessionType,
        HDPath,
        curve,
        networkId,
      })
      const addresses = state.addresses
      dispatch(`persistAddresses`, addresses)

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

      // update registered topics for emails and push notifications
      dispatch("updateNotificationRegistrations")

      state.externals.track(
        `event`,
        `session`,
        `sign-in`,
        sessionType,
        HDPath,
        curve
      )
    },
    async signOutAddress({ commit, dispatch }, signOutAddress) {
      const allSessionAddresses = await dispatch("getAllSessionAddresses")
      if (
        allSessionAddresses.find(
          ({ networkId, address }) =>
            networkId === signOutAddress.networkId &&
            address === signOutAddress.address
        )
      ) {
        dispatch("signOut", signOutAddress.networkId)
      }
      commit(
        "setUserAddresses",
        state.addresses.filter(
          ({ networkId, address }) =>
            !(
              networkId === signOutAddress.networkId &&
              address === signOutAddress.address
            )
        )
      )
      dispatch("persistAddresses", state.addresses)
    },
    async signOut({ state, commit, dispatch }, networkId) {
      state.externals.track(`event`, `session`, `sign-out`)

      dispatch(`resetSessionData`, networkId)
      commit(`setSignIn`, false)

      // update session addresses
      const allSessionAddresses = await dispatch("getAllSessionAddresses")
      commit("setAllSessionAddresses", allSessionAddresses)

      // update registered topics for emails and push notifications
      dispatch("updateNotificationRegistrations")
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
      } else {
        state.externals.anonymize()
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
          HDPath: JSON.parse(sessionEntry).HDPath,
          curve: JSON.parse(sessionEntry).curve,
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

function sessionKey(networkId) {
  return `session_${networkId}`
}

// exporting for tests
export function handleSessionCrypto({
  HDPath,
  curve,
  address,
  session,
  currentNetwork,
}) {
  if (!HDPath && !curve) {
    if (
      session &&
      session.HDPath &&
      session.curve &&
      address === session.address
    ) {
      HDPath = session.HDPath
      curve = session.curve
    } else {
      // set default if this is not defined
      HDPath = currentNetwork.defaultHDPath
      curve = currentNetwork.defaultCurve
    }
  }
  // store in localStorage for later use
  if (session) {
    localStorage.setItem(
      `cosmos-wallets-${address}`,
      JSON.stringify({
        ...session,
        HDPath,
        curve,
      })
    )
  }
  return { HDPath, curve }
}
