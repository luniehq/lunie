import Raven from "raven-js"

export default ({ node }) => {
  const emptyState = {
    parameters: {
      deposit: {},
      tallying: {},
      voting: {}
    },
    loading: false,
    error: null
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setGovParameters(state, parameters) {
      state.parameters = parameters
    }
  }

  const actions = {
    async getGovParameters({ state, commit }) {
      state.loading = true
      try {
        let deposit = await node.getGovDepositParameters()
        let tallying = await node.getGovTallyingParameters()
        let voting = await node.getGovVotingParameters()
        state.error = null
        commit(`setGovParameters`, { deposit, tallying, voting })
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching governance parameters`,
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
