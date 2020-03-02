import { track } from "scripts/google-analytics"
import gql from "graphql-tag"

export default ({ apollo }) => {
  const state = {
    accounts: [],
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
      const wallet = await getWallet(seedPhrase, network, apollo)
      return wallet.cosmosAddress
    },
    async createKey(
      { dispatch, state },
      { seedPhrase, password, name, network }
    ) {
      // TODO extract the key storage from the key creation
      const { storeWallet } = await import("@lunie/cosmos-keys")

      // create a new key pair
      const wallet = await getWallet(seedPhrase, network, apollo)

      storeWallet(wallet, name, password, network)

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
function getCosmosAddressCreator(bech32Prefix) {
  return async seedPhrase => {
    const { getNewWalletFromSeed } = await import("@lunie/cosmos-keys")
    return getNewWalletFromSeed(seedPhrase, bech32Prefix)
  }
}

// creates a polkadot address
async function createPolkadotAddress(seedPhrase) {
  const [{ Keyring }] = await Promise.all([
    import("@polkadot/keyring"),
    import("@polkadot/util-crypto").then(async ({ cryptoWaitReady }) => {
      // Wait for the promise to resolve, async WASM or `cryptoWaitReady().then(() => { ... })`
      await cryptoWaitReady()
    })
  ])

  const keyring = new Keyring({ type: "ed25519" })
  const newPair = keyring.addFromUri(seedPhrase)

  return {
    cosmosAddress: newPair.address,
    seedPhrase
  }
}

async function getWallet(seedPhrase, networkId, apollo) {
  const network = await getNetworkInfo(networkId, apollo)
  if (!network)
    throw new Error("Lunie doesn't support address creation for this network.")

  switch (network.network_type) {
    case "cosmos": {
      const addressCreator = await getCosmosAddressCreator(
        network.address_prefix
      )
      return await addressCreator(seedPhrase)
    }
    case "polkadot": {
      return await createPolkadotAddress(seedPhrase)
    }
    default:
      throw new Error(
        "Lunie doesn't support address creation for this network."
      )
  }
}

async function getNetworkInfo(networkId, apollo) {
  const {
    data: { network }
  } = await apollo.query({
    query: gql`
      query Network {
        network(id: "${networkId}") {
          id
          network_type,
          address_prefix
        }
      }
    `,
    fetchPolicy: "cache-first"
  })

  return network
}
