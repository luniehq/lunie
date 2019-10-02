import { track } from "scripts/google-analytics"

export default () => {
  const state = {
    accounts: [],
    error: null,
    // import into state to be able to test easier
    externals: {
      track
    }
  }

  const mutations = {
    setAccounts(state, accounts) {
      state.accounts = accounts
    }
  }

  const actions = {
    async loadAccounts({ commit }) {
      const { getWalletIndex } = await import("@lunie/cosmos-keys")
      const keys = getWalletIndex()
      commit(`setAccounts`, keys)
    },
    async testLogin(store, { password, address }) {
      const { testPassword } = await import("@lunie/cosmos-keys")
      try {
        testPassword(address, password)
        return true
      } catch (err) {
        return false
      }
    },
    async createSeed() {
      const { getSeed } = await import("@lunie/cosmos-keys")
      return getSeed()
    },
    async getAddressFromSeed(store, seedPhrase) {
      const { getNewWalletFromSeed } = await import("@lunie/cosmos-keys")
      const wallet = getNewWalletFromSeed(seedPhrase)
      return wallet.cosmosAddress
    },
    async createKey({ dispatch, state }, { seedPhrase, password, name }) {
      const { getNewWalletFromSeed, storeWallet } = await import(
        "@lunie/cosmos-keys"
      )

      state.externals.track(`event`, `session`, `create-keypair`)

      const wallet = getNewWalletFromSeed(seedPhrase)

      storeWallet(wallet, name, password)

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
