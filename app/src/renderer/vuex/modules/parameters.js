import Raven from "raven-js"

export default ({ node }) => {
  const emptyState = {
    parameters: {},
    loading: false
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setStakingParameters(state, parameters) {
      console.log(parameters)
      state.parameters = parameters
    }
  }

  const actions = {
    async getStakingParameters({ state, commit }) {
      state.loading = true
      try {
        let parameters = await node.getStakingParameters()
        state.error = null
        commit(`setStakingParameters`, parameters)
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
