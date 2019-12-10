import { track } from "scripts/google-analytics"

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
      switch (network) {
        case "cosmos-hub-mainnet":
        case "cosmos-hub-testnet":
        case "regen-testnet":
        case "terra-testnet": {
          const {
            data: {
              network: { bech32_prefix }
            }
          } = await apollo.query({
            query: `
              query ImportPrefix($networkId: String!) {
                network(id: $networkId) {
                  bech32_prefix
                }
              }
            `,
            variables: {
              networkId: network
            }
          })
          const { getNewWalletFromSeed } = await import("@lunie/cosmos-keys")
          const wallet = getNewWalletFromSeed(seedPhrase, bech32_prefix)
          return wallet.cosmosAddress
        }
        default:
          throw new Error(
            "Lunie doesn't support address creation for this network."
          )
      }
    },
    async createKey(
      { dispatch, state },
      { seedPhrase, password, name, network }
    ) {
      const { storeWallet } = await import("@lunie/cosmos-keys")
      let wallet
      switch (network) {
        case "cosmos-hub-mainnet":
        case "cosmos-hub-testnet":
        case "regen-testnet":
        case "terra-testnet":
          {
            const {
              data: {
                network: { bech32_prefix }
              }
            } = await apollo.query({
              query: `
              query ImportPrefix($networkId: String!) {
                network(id: $networkId) {
                  bech32_prefix
                }
              }
            `,
              variables: {
                networkId: network
              }
            })
            const { getNewWalletFromSeed } = await import("@lunie/cosmos-keys")
            wallet = getNewWalletFromSeed(seedPhrase, bech32_prefix)
          }
          break
        default:
          throw new Error(
            "Lunie doesn't support address creation for this network."
          )
      }

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
