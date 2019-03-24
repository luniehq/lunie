import * as Sentry from "@sentry/browser"

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
    async getStakingParameters({ state, commit, rootState }) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        const parameters = await node.getStakingParameters()
        commit(`setStakingParameters`, parameters)
        state.error = null
        state.loading = false
        state.loaded = true
      } catch (error) {
        Sentry.captureException(error)
        state.error = `Error fetching staking parameters: ${error.message}`
      }
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
