import config from "src/../config"

export default function () {
  const state = {
    stopConnecting: false,
    connected: true, // TODO do connection test
    network: config.network, // network id to reference network capabilities stored in Hasura
    networkTitle: "Cosmos Hub",
    nodeUrl: config.stargate,
    externals: {
      config
    }
  }

  const mutations = {
    setNetworkId(state, networkId) {
      state.network = networkId
    },
    setNetworkTitle(state, networkTitle) {
      state.networkTitle = networkTitle
    }
  }

  const actions = {
    async checkForPersistedNetwork({ commit }) {
      const network = JSON.parse(localStorage.getItem(`network`))
      if (network) {
        commit(`setNetworkId`, network.id)
        commit(`setNetworkTitle`, network.title)
      }
    },
    async persistNetwork(store, network) {
      localStorage.setItem(`network`, JSON.stringify({
        id: network.id,
        title: network.title
      }))
    },
    async setNetwork({ commit, dispatch }, network) {
      dispatch(`signOut`)
      dispatch(`persistNetwork`, network)
      commit("setNetworkId", network.id)
      commit(`setNetworkTitle`, network.title)
      console.info(`Connecting to: ${network.id}`)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
