import gql from "graphql-tag"
import config from "src/config.js"

export default ({ apollo }) => {
  const state = {
    loading: false,
    loaded: false,
    error: null,
    networks: [],
    network: null
  }

  const mutations = {
    setNetworks: (state, networks) => {
      state.networks = networks
    },
    setNetwork: (state, network) => {
      state.network = network
    }
  }

  const actions = {
    init({ dispatch }) {
      dispatch("loadNetworks")
      dispatch("loadNetwork", config.network)
    },
    async loadNetworks({ commit }) {
      const response = await apollo.query({
        query: gql`
          query Networks {
            networks {
              chain_id
              logo_url
              testnet
              title
            }
          }
        `
      })

      const { networks } = response.data
      commit("setNetworks", networks)
    },
    async loadNetwork({ commit }, id) {
      const response = await apollo.query({
        query: gql`
          query Networks {
            networks(where: {id: {_eq: "${id}"}}) {
              action_delegate
              action_proposal
              action_deposit
              action_vote
              action_redelegate
              action_send
              action_undelegate
              action_withdraw
              api_url
              bech32_prefix
              feature_activity
              chain_id
              feature_blocks
              feature_portfolio
              feature_proposals
              feature_sessions
              feature_validators
              logo_url
              rpc_url
              testnet
              title
            }
          }
        `
      })

      const { networks } = response.data
      commit("setNetwork", networks[0])
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
