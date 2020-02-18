import config from "src/../config"
import { Networks } from "../../gql"

export default function({ apollo }) {
  const state = {
    stopConnecting: false,
    connected: true, // TODO do connection test
    network: config.network, // network id to reference network capabilities stored in Hasura
    networkSlug: "",
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
    }
  }

  const actions = {
    async checkForPersistedNetwork({ dispatch, commit }) {
      const persistedNetwork = JSON.parse(localStorage.getItem(`network`))
      const { data } = await apollo.query({
        query: Networks,
        fetchPolicy: "cache-first"
      })
      // find stored network in networks array
      const storedNetwork = persistedNetwork
        ? data.networks.find(network => network.id == persistedNetwork)
        : false
      if (persistedNetwork && storedNetwork) {
        await commit(`setNetworkId`, storedNetwork.id)
        await commit(`setNetworkSlug`, storedNetwork.slug)
      } else {
        const defaultNetwork = data.networks.find(
          network => network.id == state.externals.config.network
        )
        if (defaultNetwork) {
          // remove additional execution of checkForPersistedNetwork
          await commit(`setNetworkId`, defaultNetwork.id)
          await commit(`setNetworkSlug`, defaultNetwork.slug)
          await dispatch(`persistNetwork`, defaultNetwork)
        } else {
          // otherwise we connect to a fallback network
          const fallbackNetwork = data.networks.find(
            network => network.id == state.externals.config.fallbackNetwork
          )
          await commit(`setNetworkId`, fallbackNetwork.id)
          await commit(`setNetworkSlug`, fallbackNetwork.slug)
          await dispatch(`persistNetwork`, fallbackNetwork)
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
