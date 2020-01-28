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

async function getWallet(seedPhrase, networkId, apollo) {
  const {
    data: { network }
  } = await apollo.query({
    query: gql`
      query Network {
        network(id: "${networkId}") {
          id
          address_creator,
          address_prefix
        }
      }
    `,
    fetchPolicy: "cache-first"
  })

  if (!network)
    throw new Error("Lunie doesn't support address creation for this network.")

  switch (network.address_creator) {
    case "cosmos": {
      const addressCreator = await getCosmosAddressCreator(
        network.address_prefix
      )
      return addressCreator(seedPhrase)
    }
  }
}
