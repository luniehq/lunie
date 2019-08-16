export default ({ node }) => {
  const emptyState = {
    parameters: {
      deposit: {},
      tallying: {},
      voting: {}
    },
    loading: false,
    loaded: false,
    error: null
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setGovParameters(state, parameters) {
      state.parameters = parameters
    }
  }

  const actions = {
    signIn({ dispatch }) {
      // needed for deposit denom for governance
      dispatch(`getGovParameters`)
    },
    async getGovParameters({ state, commit, rootState }) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        const deposit = await node.get.govDepositParameters()
        const tallying = await node.get.govTallyingParameters()
        const voting = await node.get.govVotingParameters()
        state.error = null
        state.loading = false
        state.loaded = true
        commit(`setGovParameters`, { deposit, tallying, voting })
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching governance parameters`,
          body: error.message
        })
        state.error = error
      }
      state.loading = false
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
