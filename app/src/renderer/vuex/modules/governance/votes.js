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
    async submitVote({ rootState, dispatch }, { proposalId, option }) {
      console.log(rootState.wallet.address)
      await dispatch(`sendTx`, {
        type: `submitProposalVote`,
        proposal_id: proposalId,
        voter: rootState.wallet.address,
        option
      })
      setTimeout(async () => {
        dispatch(`getProposalVotes`, proposalId)
      }, 5000)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
