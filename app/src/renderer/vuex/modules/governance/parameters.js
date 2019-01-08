import * as Sentry from "@sentry/browser"

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
    async getGovParameters({ state, commit, rootState }) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        let deposit = await node.getGovDepositParameters()
        let tallying = await node.getGovTallyingParameters()
        let voting = await node.getGovVotingParameters()
        state.error = null
        state.loading = false
        state.loaded = true
        commit(`setGovParameters`, { deposit, tallying, voting })
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching governance parameters`,
          body: error.message
        })
        Sentry.captureException(error)
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
