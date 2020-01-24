import { track } from "scripts/google-analytics"
import config from "src/../config"

export default () => {
  const state = {
    accounts: [],
    error: null,
    // import into state to be able to test easier
    externals: {
      track,
      config
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
    async getAddressFromSeed(store, { seedPhrase, network, prefix }) {
      const wallet = await getWallet(seedPhrase, network, prefix)
      return wallet.cosmosAddress
    },
    async createKey(
      { dispatch, state },
      { seedPhrase, password, name, network, prefix }
    ) {
      // TODO extract the key storage from the key creation
      const { storeWallet } = await import("@lunie/cosmos-keys")
      const wallet = await getWallet(seedPhrase, network, prefix)

      storeWallet(wallet, name, password)

      state.externals.track(`event`, `session`, `create-keypair`)

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

// creates a cosmos addres for the network desired
function getCosmosAddressCreator(network, networkPrefix) {
  return async seedPhrase => {
    const { getNewWalletFromSeed } = await import("@lunie/cosmos-keys")
    networkPrefix = networkPrefix || config.bech32Prefixes[network]
    return getNewWalletFromSeed(seedPhrase, networkPrefix)
  }
}

async function getWallet(seedPhrase, network, networkPrefix) {
  if (networkPrefix) {
    const addressCreator = await getCosmosAddressCreator(network, networkPrefix)
    return addressCreator(seedPhrase)
  } else {
    switch (network) {
      case "cosmos-hub-mainnet":
      case "cosmos-hub-testnet":
      case "regen-testnet":
      case "regen-mainnet":
      case "terra-testnet":
      case "emoney-testnet":
      case "emoney-mainnet":
      case "terra-mainnet": {
        const addressCreator = await getCosmosAddressCreator(network)
        return addressCreator(seedPhrase)
      }
      default:
        throw new Error(
          "Lunie doesn't support address creation for this network."
        )
    }
  }
}
