import Raven from "raven-js"

export default ({ node }) => {
  const emptyState = {
    parameters: {},
    loading: false
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setParameters(state, parameters) {
      state.parameters = parameters
    }
  }

  const actions = {
    async getParameters({ state, commit }) {
      state.loading = true
      try {
        let parameters = await node.getParameters()
        state.error = null
        commit(`setParameters`, parameters)
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching staking parameters`,
          body: error.message
        })
        Raven.captureException(error)
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
