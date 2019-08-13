export default ({ node }) => {
  const emptyState = {
    parameters: {},
    loading: false,
    loaded: false,
    error: null
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setStakingParameters(state, parameters) {
      state.parameters = parameters
    }
  }

  const actions = {
    signIn({ dispatch }) {
      // needed for bond denom for gas calculation
      dispatch(`getStakingParameters`)
    },
    async getStakingParameters({ state, commit, rootState }) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        const parameters = await node.get.stakingParameters()
        commit(`setStakingParameters`, parameters)
        state.error = null
        state.loading = false
        state.loaded = true
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching staking parameters`,
          body: error.message
        })
        state.error = error
      }
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
