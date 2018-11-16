export default ({ node }) => {
  const emptyState = {
    govParameters: {
      deposit: {},
      tallying: {},
      voting: {}
    },
    loading: false
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
        commit(`setGovParameters`, { deposit, tallying, voting })
      } catch ({ message }) {
        commit(`notifyError`, {
          title: `Error fetching governance parameters`,
          body: message
        })
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
