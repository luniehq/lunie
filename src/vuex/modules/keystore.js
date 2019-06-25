import * as Sentry from "@sentry/browser"
import { track } from "scripts/google-analytics.js"
import {
  getSeed,
  getWalletIndex,
  getStoredWallet,
  getNewWalletFromSeed,
  testPassword,
  storeWallet
} from "@lunie/cosmos-keys"

export default () => {
  const state = {
    accounts: [],
    error: null,
    // import into state to be able to test easier
    externals: {
      getWalletIndex,
      getStoredWallet,
      getNewWalletFromSeed,
      testPassword,
      storeWallet,
      getSeed,
      track,
      Sentry
    }
  }

  const mutations = {
    setAccounts(state, accounts) {
      state.accounts = accounts
    }
  }

  const actions = {
    init({ dispatch }) {
      dispatch("loadAccounts")
    },
    async loadAccounts({ commit, state }) {
      const keys = state.externals.getWalletIndex()
      commit(`setAccounts`, keys)
    },
    async testLogin({ state }, { password, address }) {
      try {
        state.externals.testPassword(address, password)
        return true
      } catch (err) {
        return false
      }
    },
    createSeed() {
      return state.externals.getSeed()
    },
    async createKey({ dispatch, state }, { seedPhrase, password, name }) {
      state.externals.track(`event`, `session`, `create-keypair`)

      const wallet = state.externals.getNewWalletFromSeed(seedPhrase)
      state.externals.storeWallet(wallet, name, password)

      // reload accounts as we just added a new one
      dispatch("loadAccounts")

      await dispatch("signIn", {
        address: wallet.cosmosAddress,
        sessionType: "local"
      })

      return wallet.cosmosAddress
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
