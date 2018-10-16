"use strict"

export default ({ node }) => {
  const state = {
    loading: false,
    votes: []
  }

  const mutations = {
    setProposalVote({ state }, proposalId, votes) {
      state.proposals[proposalId].votes = votes
    }
  }
  const actions = {
    async getProposalVotes({ state, commit }, proposalId) {
      state.loading = true
      let votes = await node.queryProposalVotes(proposalId)
      commit(`setProposalVotes`, proposalId, votes)
      state.loading = false
    },
    async submitDeposit(
      {
        rootState: { wallet },
        dispatch
      },
      { proposalId, option }
    ) {
      await dispatch(`sendTx`, {
        type: `submitVote`,
        proposalID: proposalId,
        voter: wallet.address,
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
