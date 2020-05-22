import { track } from "scripts/google-analytics"
import { getWallet } from "./wallet"
export default () => {
  const state = {
    accounts: [],
    // import into state to be able to test easier
    externals: {
      track,
    },
  }

  const mutations = {
    setAccounts(state, accounts) {
      state.accounts = accounts
    },
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
    async getAddressFromSeed(store, { seedPhrase, network }) {
      // get current network
      const networkObject = await getNetworkInfo(network, store)

      const wallet = await getWallet(seedPhrase, networkObject)
      return wallet.cosmosAddress
    },
    async createKey(store, { seedPhrase, password, name, network }) {
      // TODO extract the key storage from the key creation
      const { storeWallet } = await import("@lunie/cosmos-keys")

      // get current network
      const networkObject = await getNetworkInfo(network, store)
      // create a new key pair
      const wallet = await getWallet(seedPhrase, networkObject)

      storeWallet(wallet, name, password, network)

      store.state.externals.track(`event`, `session`, `create-keypair`)

      // reload accounts as we just added a new one
      store.dispatch("loadAccounts")

      await store.dispatch("signIn", {
        address: wallet.cosmosAddress,
        sessionType: "local",
        networkId: network,
      })

      return wallet.cosmosAddress
    },
  }

  async function getNetworkInfo(networkId, store) {
    return store.getters.networks.find(({ id }) => id === networkId)
  }

  return {
    state,
    mutations,
    actions,
  }
}
