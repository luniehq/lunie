"use strict"

export default ({ node }) => {
  const state = {
    loading: false,
    error: null,
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
      try {
        let votes = await node.queryProposalVotes(proposalId)
        commit(`setProposalVotes`, proposalId, votes)
        state.error = null
      } catch (err) {
        console.error(err)
        state.error = err
      }
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
