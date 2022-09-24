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
    async getWallet(store, { address, password }) {
      const { getStoredWallet } = await import("@lunie/cosmos-keys")
      try {
        const wallet = getStoredWallet(address, password)
        return wallet
      } catch (error) {
        /* istanbul ignore next */
        return error
      }
    },
    async loadLocalAccounts({ commit, dispatch }) {
      const { getWalletIndex } = await import("@lunie/cosmos-keys")
      const wallets = getWalletIndex()

      const walletsWithNetworks = await Promise.all(
        wallets.map(async (wallet) => {
          // old entries don't have the network property so we need to guess it
          if (!wallet.network) {
            const network = await dispatch("getNetworkByAccount", {
              account: wallet,
            })
            wallet.network = network ? network.id : undefined
          }
          return wallet
        })
      )
      commit(`setAccounts`, walletsWithNetworks)
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
    async testSeed(store, { networkId, address, seedPhrase }) {
      const networkObject = store.getters.networks.find(
        ({ id }) => id === networkId
      )
      if (!networkObject) throw new Error("Couldn't get network for key.")
      const walletVariations = JSON.parse(networkObject.HDPaths).reduce(
        (all, HDPath) => {
          return JSON.parse(networkObject.curves).reduce((all2, curve) => {
            all2.push({ HDPath, curve })
            return all2
          }, [])
        },
        []
      )
      const foundCombination = await Promise.all(
        walletVariations.map(async ({ HDPath, curve }) => {
          const wallet = await getWallet(
            seedPhrase,
            networkObject,
            HDPath.value,
            curve.value
          )
          return wallet && wallet.cosmosAddress === address ? true : false
        })
      )
      return foundCombination.find((combination) => !!combination)
        ? true
        : false
    },
    async createKey(
      store,
      { seedPhrase, password, name, HDPath, curve, network }
    ) {
      // TODO extract the key storage from the key creation
      const { storeWallet } = await import("@lunie/cosmos-keys")

      // get current network
      const networkObject = await getNetworkInfo(network, store)
      // create a new key pair
      const wallet = await getWallet(seedPhrase, networkObject, HDPath, curve)

      storeWallet(wallet, name, password, network, HDPath, curve)

      store.state.externals.track(`event`, `session`, `create-keypair`)

      // reload accounts as we just added a new one
      store.dispatch("loadLocalAccounts")

      await store.dispatch("signIn", {
        address: wallet.cosmosAddress,
        sessionType: "local",
        HDPath,
        curve,
        networkId: network,
      })

      return wallet.cosmosAddress
    },
    async deleteKey(store, address) {
      const { removeFromStorage } = await import("@lunie/cosmos-keys")
      removeFromStorage(address)

      // reload accounts as we just removed one
      store.dispatch("loadLocalAccounts")

      return true
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
