import config from "src/../config"
import { Networks } from "../../gql"
import { print } from "graphql/language/printer"
import axios from "axios"

export default function() {
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
      const network = JSON.parse(localStorage.getItem(`network`))
      dispatch(`checkAvailableNetworks`).then( async result => {
        let availNetworks = result.data.data.networks
        let availNetworksID = Object.values(availNetworks).map(
          network => network.id
        )
        // Little hack to reorder the array so 'cosmos-hub-mainnet' stays at the beginning
        if (availNetworks.length > 1) {
          availNetworks = availNetworks.sort( (n1, n2) => (n1.testnet > n2.testnet) ? 1 : -1)
        }
        if (network && availNetworksID.includes(network)) {
          await commit(`setNetworkId`, network)
        } else if (network && !availNetworksID.includes(network)) {
          await dispatch(`setNetwork`, availNetworks[0])
        }      
      }).catch( error => {
        console.error('Error', error)
      })


    },
    async persistNetwork(store, network) {
      localStorage.setItem(`network`, JSON.stringify(network.id))
    },
    async setNetwork({ commit, dispatch }, network) {
      dispatch(`signOut`)
      dispatch(`persistNetwork`, network)
      commit("setNetworkId", network.id)
      console.info(`Connecting to: ${network.id}`)
    },
    async checkAvailableNetworks() {
      let networksQuery = print(Networks)
      return await axios
      .post(
        process.env.VUE_APP_GRAPHQL_URL || `http://127.0.0.1:4000`,
        {query: networksQuery}
      )
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
