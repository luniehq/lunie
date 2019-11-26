import config from "src/../config"
import { Networks } from "../../gql"

export default function({ apollo }) {
  const state = {
    stopConnecting: false,
    connected: true, // TODO do connection test
    network: config.network, // network id to reference network capabilities stored in Hasura
    externals: {
      config
    }
  }

  const mutations = {
    setNetworkId(state, networkId) {
      state.network = networkId
    }
  }

  const actions = {
    async checkForPersistedNetwork({ dispatch, commit }) {
      const persistedNetwork = JSON.parse(localStorage.getItem(`network`))
      const { data } = await apollo.query({
        query: Networks
      })
      let availNetworks = Object.values(data.networks).map( network => network.id)
      if (persistedNetwork && availNetworks.includes(persistedNetwork)) {
        await commit(`setNetworkId`, persistedNetwork)
      } else {
        if (availNetworks.find( network => network === `cosmos-hub-mainnet`)) {
          // we connect as default to cosmos-hub-mainnet
          await dispatch(`setNetwork`, data.networks.find(({id}) => id === `cosmos-hub-mainnet`))
        } else {
          // otherwise we connect to local-cosmos-hub-testnet
          await dispatch(`setNetwork`, data.networks.find(({id}) => id === `local-cosmos-hub-testnet`))
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
      console.info(`Connecting to: ${network.id}`)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
