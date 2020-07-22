import config from "src/../config"
import bech32 from "bech32"
import { NetworksAll } from "../../gql"
import { getPolkadotAPI } from "../../../../common/polkadotApiConnector"

const isPolkadotAddress = (address) => {
  const polkadotRegexp = /^(([0-9a-zA-Z]{47})|([0-9a-zA-Z]{48}))$/
  return polkadotRegexp.test(address)
}

const isValidPolkadotAddress = async (address, addressPrefix) => {
  const { checkAddress } = await import("@polkadot/util-crypto")
  return checkAddress(address, addressPrefix)
}

export default function ({ apollo }) {
  const state = {
    stopConnecting: false,
    network: config.network, // network id to reference network capabilities stored in Hasura
    networkSlug: "cosmos-hub",
    networks: [],
    addressType: undefined,
    externals: {
      config,
    },
  }

  const mutations = {
    setNetworkId(state, networkId) {
      state.network = networkId
    },
    setNetworkSlug(state, networkSlug) {
      state.networkSlug = networkSlug
    },
    setAddressType(state, addressType) {
      state.addressType = addressType
    },
    setNetworks(state, networks) {
      state.networks = networks
    },
  }

  const actions = {
    async checkForPersistedNetwork({ dispatch, commit }) {
      const persistedNetwork = JSON.parse(localStorage.getItem(`network`))
      // find stored network in networks array
      const storedNetwork = persistedNetwork
        ? state.networks.find((network) => network.id === persistedNetwork)
        : false
      if (persistedNetwork && storedNetwork) {
        await dispatch(`setNetwork`, storedNetwork)
      } else {
        const network =
          state.networks.find(
            (network) => network.id === state.externals.config.network
          ) || state.networks[0]
        // remove additional execution of checkForPersistedNetwork
        await dispatch(`setNetwork`, network)
      }
    },
    async getNetworkByAccount(
      { state },
      { account: { network, address }, testnet = false }
    ) {
      if (network) {
        return state.networks.find(({ id }) => id === network)
      }
      // HACK as polkadot addresses don't have a prefix
      if (isPolkadotAddress(address)) {
        let selectedNetwork = undefined
        const substrateNetworks = await state.networks.filter(
          ({ network_type }) => network_type === `polkadot`
        )
        for (let index = 0; index < substrateNetworks.length; index++) {
          const network = substrateNetworks[index]
          if (
            (
              await isValidPolkadotAddress(
                address,
                parseInt(network.address_prefix)
              )
            )[0]
          ) {
            selectedNetwork = network
            break
          }
        }
        if (selectedNetwork) {
          return selectedNetwork
        } else {
          throw new Error(
            "Address is not in a valid polkadot format. Did you mistype?"
          )
        }
      }

      const selectedNetworksArray = state.networks.filter(
        ({ address_prefix, network_type }) => {
          if (network_type === "cosmos") {
            if (address.startsWith(address_prefix)) {
              if (!address.startsWith(address_prefix + "1")) {
                throw new Error("Only staker addresses are supported in Lunie")
              }
              try {
                bech32.decode(address)
              } catch {
                throw new Error(
                  "Address is not in bech32 format. Did you mistype?"
                )
              }
              return true
            }
            return false
          }
        }
      )

      const selectedNetwork = selectedNetworksArray.find(
        (network) => network.testnet === testnet
      )

      if (!selectedNetwork) {
        throw new Error(`No network found in Lunie for the address ${address}`)
      }

      return selectedNetwork
    },
    async persistNetwork(store, network) {
      localStorage.setItem(`network`, JSON.stringify(network.id))
    },
    async preloadNetworkCapabilities({
      commit,
      rootState: {
        session: { experimentalMode },
      },
    }) {
      const { data } = await apollo.query({
        query: NetworksAll,
        variables: { experimental: experimentalMode },
        fetchPolicy: "network-only",
      })
      commit("setNetworks", data.networks)
    },
    async setNetwork({ commit, dispatch }, network) {
      dispatch(`signOut`)
      dispatch(`persistNetwork`, network)
      commit("setNetworkId", network.id)
      if (network.slug) {
        commit("setNetworkSlug", network.slug)
      }
      commit("setAddressType", network.address_creator)
      dispatch(`checkForPersistedSession`) // check for persisted session on that network
      if (network.network_type === `polkadot`) {
        // we initialize the API on sign in so it is available when the user wants to use it
        getPolkadotAPI(network)
      }
      console.info(`Connecting to: ${network.id}`)
    },
  }

  return {
    state,
    mutations,
    actions,
  }
}
