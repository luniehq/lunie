export default ({ node }) => {
  const emptyState = {
    govParameters: {
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
      state.govParameters = parameters
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
      } catch (err) {
        commit(`notifyError`, {
          title: `Error fetching governance parameters`,
          body: err.message
        })
        state.error = err
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
