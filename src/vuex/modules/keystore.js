import { track } from "scripts/google-analytics"
import { Networks } from "../../gql"

export default ({ apollo }) => {
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

  const getBech32Prefix = async () => {
    const { data } = await apollo.query({
      query: Networks
    })
    const currentNetwork = JSON.parse(localStorage.getItem(`network`))
    // search for the correct bech32prefix
    const bech32Prefix = data.networks.filter(
      network => network.id === currentNetwork
    )[0].bech32_prefix

    // handle exceptions
    if (bech32Prefix === `0x`) {
      // TODO: display this error also for the user
      console.error(`No current support for Livepeers accounts. Coming soon`)
    }

    return bech32Prefix
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
      const bech32Prefix = await getBech32Prefix()
      const wallet = getNewWalletFromSeed(seedPhrase, bech32Prefix)
      return wallet.cosmosAddress
    },
    async createKey({ dispatch, state }, { seedPhrase, password, name }) {
      const { getNewWalletFromSeed, storeWallet } = await import(
        "@lunie/cosmos-keys"
      )

      state.externals.track(`event`, `session`, `create-keypair`)
      const bech32Prefix = await getBech32Prefix()
      const wallet = getNewWalletFromSeed(seedPhrase, bech32Prefix)

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
