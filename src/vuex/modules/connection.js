import config from "src/../config"
import { Networks } from "../../gql"

export default function({ apollo }) {
  const state = {
    stopConnecting: false,
    connected: true, // TODO do connection test
    network: config.network, // network id to reference network capabilities stored in Hasura
    networkSlug: "cosmos-hub",
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
    }
  }

  const actions = {
    async checkForPersistedNetwork({ dispatch, commit }) {
      const persistedNetwork = JSON.parse(localStorage.getItem(`network`))
      // just to disbale network change on e2e tests
      const { data } = await apollo.query({
        query: Networks,
        fetchPolicy: "cache-first"
      })
      // find stored network in networks array
      const storedNetwork = persistedNetwork
        ? data.networks.find(network => network.id === persistedNetwork)
        : false
      if (persistedNetwork && storedNetwork) {
        await dispatch(`setNetwork`, storedNetwork)
      } else {
        const defaultNetwork = data.networks.find(
          network => network.id === state.externals.config.network
        )
        if (defaultNetwork) {
          // remove additional execution of checkForPersistedNetwork
          await dispatch(`setNetwork`, defaultNetwork)
          await commit(`setNetworkSlug`, defaultNetwork.slug)
        } else {
          // otherwise we connect to a fallback network
          const fallbackNetwork = data.networks.find(
            network => network.id == state.externals.config.fallbackNetwork
          )
          // I don't know why this doesn't work anymore...
          // await dispatch(`setNetwork`, fallbackNetwork)
          // and I have to do it like this for the tests to pass
          await this.setNetwork({ dispatch, commit }, fallbackNetwork)
        }
      }
    },
    async persistNetwork(store, network) {
      localStorage.setItem(`network`, JSON.stringify(network.id))
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
