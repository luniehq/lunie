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
    async getAddressFromSeed(store, { seedPhrase, network }) {
      const wallet = await getWallet(seedPhrase, network)
      return wallet.cosmosAddress
    },
    async createKey(
      { dispatch, state },
      { seedPhrase, password, name, network }
    ) {
      // TODO extract the key storage from the key creation
      const { storeWallet } = await import("@lunie/cosmos-keys")
      const wallet = await getWallet(seedPhrase, network)

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
function getCosmosAddressCreator(network) {
  return async seedPhrase => {
    const bech32Prefixes = {
      "cosmos-hub-mainnet": "cosmos",
      "cosmos-hub-testnet": "cosmos",
      "regen-testnet": "xrn:",
      "regen-mainnet": "xrn:",
      "terra-testnet": "terra",
      "terra-mainnet": "terra",
      "emoney-testnet": "emoney",
      "emoney-mainnet": "emoney"
    }
    const { getNewWalletFromSeed } = await import("@lunie/cosmos-keys")
    return getNewWalletFromSeed(seedPhrase, bech32Prefixes[network])
  }
}

async function getWallet(seedPhrase, network) {
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
