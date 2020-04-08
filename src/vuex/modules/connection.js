import config from "src/../config"
import bech32 from "bech32"
import { NetworksAll } from "../../gql"

const isPolkadotAddress = address => {
  const polkadotRegexp = /^(([0-9a-zA-Z]{47})|([0-9a-zA-Z]{48}))$/
  return polkadotRegexp.test(address)
}

export default function({ apollo }) {
  const state = {
    stopConnecting: false,
    connected: true, // TODO do connection test
    network: config.network, // network id to reference network capabilities stored in Hasura
    networkSlug: "cosmos-hub",
    networks: [],
    addressType: undefined,
    externals: {
      config
    }
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
    }
  }

  const actions = {
    async checkForPersistedNetwork({ dispatch, commit }) {
      const persistedNetwork = JSON.parse(localStorage.getItem(`network`))
      // find stored network in networks array
      const storedNetwork = persistedNetwork
        ? state.networks.find(network => network.id === persistedNetwork)
        : false
      if (persistedNetwork && storedNetwork) {
        await dispatch(`setNetwork`, storedNetwork)
      } else {
        const defaultNetwork = state.networks.find(
          network => network.id === state.externals.config.network
        )
        if (defaultNetwork) {
          // remove additional execution of checkForPersistedNetwork
          await dispatch(`setNetwork`, defaultNetwork)
          await commit(`setNetworkSlug`, defaultNetwork.slug)
        } else {
          // otherwise we connect to a fallback network
          const fallbackNetwork = state.networks.find(
            network => network.id == state.externals.config.fallbackNetwork
          )
          await dispatch("setNetwork", fallbackNetwork)
        }
      }
    },
    getNetworkByAccount(
      { state },
      { account: { network, address }, testnet = false }
    ) {
      if (network) {
        return state.networks.find(({ id }) => id === network)
      }
      // HACK as polkadot addresses don't have a prefix
      if (isPolkadotAddress(address) && testnet) {
        return state.networks.find(({ id }) => id === "polkadot-testnet")
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
        network => network.testnet === testnet
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
        session: { experimentalMode }
      }
    }) {
      const { data } = await apollo.query({
        query: NetworksAll,
        variables: { experimental: experimentalMode },
        fetchPolicy: "network-only"
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
      console.info(`Connecting to: ${network.id}`)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
