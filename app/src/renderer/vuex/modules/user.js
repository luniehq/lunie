import enableGoogleAnalytics from "../../google-analytics.js"
import Raven from "raven-js"
const { ipcRenderer, remote } = require("electron")
const config = remote.getGlobal("config")

export default ({ node }) => {
  const ERROR_COLLECTION_KEY = "voyager_error_collection"

  let state = {
    atoms: 0,
    signedIn: false,
    accounts: [],
    pauseHistory: false,
    history: [],
    password: null,
    account: null,
    address: null,
    errorCollection: false
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
    },
    clearHistory(state) {
      state.history = []
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
      await dispatch("loadAccounts")
    },
    async showInitialScreen({ dispatch, commit }) {
      dispatch("resetSessionData")

      await dispatch("loadAccounts")
      let exists = state.accounts.length > 0
      let screen = exists ? "sign-in" : "welcome"
      commit("setModalSessionState", screen)
    },
    async loadAccounts({ commit }) {
      try {
        let keys = await node.listKeys()
        commit("setAccounts", keys)
      } catch (err) {
        commit("notifyError", {
          title: `Couldn't read keys`,
          body: err.message
        })
      }
    },
    async testLogin(state, { password, account }) {
      try {
        return await node.updateKey(account, {
          name: account,
          new_password: password,
          old_password: password
        })
      } catch (err) {
        throw Error("Incorrect passphrase")
      }
    },
    createSeed() {
      // generate seed phrase
      return node.generateSeed()
    },
    async createKey({ commit, dispatch }, { seedPhrase, password, name }) {
      let { address } = await node.storeKey({
        name,
        password,
        seed: seedPhrase
      })
      dispatch("initializeWallet", address)
      return address
    },
    async deleteKey(ignore, { password, name }) {
      await node.deleteKey(name, { name, password })
      return true
    },
    async signIn({ state, commit, dispatch }, { password, account }) {
      state.password = password
      state.account = account
      state.signedIn = true

      let { address } = await node.getKey(account)
      state.address = address

      commit("setModalSession", false)
      dispatch("initializeWallet", address)
      dispatch("loadErrorCollection", account)
    },
    signOut({ state, commit, dispatch }) {
      state.password = null
      state.account = null
      state.signedIn = false

      commit("setModalSession", true)
      dispatch("showInitialScreen")
    },
    resetSessionData({ commit }) {
      commit("clearHistory")
      commit("setActiveMenu", "")
    },
    loadErrorCollection({ state, dispatch }, account) {
      let errorCollection =
        localStorage.getItem(`${ERROR_COLLECTION_KEY}_${account}`) === "true"
      if (state.errorCollection !== errorCollection)
        dispatch("setErrorCollection", { account, optin: errorCollection })
    },
    setErrorCollection({ state, commit }, { account, optin }) {
      if (state.errorCollection !== optin && config.development) {
        commit("notifyError", {
          title: `Couldn't switch ${optin ? "on" : "off"} error collection.`,
          body: "Error collection is disabled during development."
        })
      }
      state.errorCollection = config.development ? false : optin
      localStorage.setItem(
        `${ERROR_COLLECTION_KEY}_${account}`,
        state.errorCollection
      )

      Raven.uninstall()
        .config(state.errorCollection ? config.sentry_dsn_public : "")
        .install()
      if (state.errorCollection) {
        console.log("Analytics enabled in browser")
        enableGoogleAnalytics(config.google_analytics_uid)
      } else {
        console.log("Analytics disabled in browser")
        window.analytics = null
      }

      ipcRenderer.send("error-collection", state.errorCollection)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
