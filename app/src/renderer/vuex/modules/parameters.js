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
        let parameters = await node.getStakingParameters()
        state.error = null
        commit(`setStakingParameters`, parameters)
        state.error = null
        state.loading = false
        state.loaded = true
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching staking parameters`,
          body: error.message
        })
        Sentry.captureException(error)
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
