import config from "src/config"

export default function({ node }) {
  const state = {
    stopConnecting: false,
    connected: true, // TODO do connection test
    network: config.network, // network id to reference network capabilities stored in Hasura
    connectionAttempts: 0,
    nodeUrl: config.stargate,
    externals: {
      node,
      config
    }
  }

  const mutations = {
    setNetworkId(state, networkId) {
      state.network = networkId
    }
  }

  const actions = {
    async setNetwork({ commit }, network) {
      commit("setNetworkId", network.id)
      console.info(`Connecting to: ${network.title} (${network.chain_id})`)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
