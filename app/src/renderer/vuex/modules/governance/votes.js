"use strict"

export default ({ node }) => {
  const state = {
    loading: false,
    votes: {}
  }

  const mutations = {
    setProposalVotes(state, proposalId, votes) {
      state.votes[proposalId] = votes
    }
  }
  let actions = {
    async getProposalVotes({ state, commit }, proposalId) {
      state.loading = true
      let votes = await node.queryProposalVotes(proposalId)
      commit(`setProposalVotes`, proposalId, votes)
      state.loading = false
    },
    async submitVote({ rootState, dispatch }, proposalId, option) {
      await dispatch(`sendTx`, {
        type: `submitProposalVote`,
        proposal_id: proposalId,
        voter: rootState.wallet.address,
        option
      })
      dispatch(`getProposalVotes`, proposalId)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
