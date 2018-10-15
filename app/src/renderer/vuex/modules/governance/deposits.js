"use strict"

export default ({ node }) => {
  const state = {
    loading: false,
    deposits: []
  }

  const mutations = {
    setProposalDeposits(state, proposalId, deposits) {
      if (state.proposals.length >= proposalId) {
        // exit and notify error ?
      }
      state.proposals[proposalId].deposits = deposits
    }
  }
  const actions = {
    async getProposalDeposits({ state, commit }, proposalId) {
      state.loading = true
      let deposits = await node.queryProposalDeposits(proposalId)
      commit(`setProposalDeposits`, proposalId, deposits)
      state.loading = false
    },
    async getProposalDeposit({ state, commit }, proposalId, address) {
      state.loading = true
      let deposit = await node.queryProposalDeposit(proposalId, address)
      commit(`setProposalDeposits`, proposalId, deposit)
      state.loading = false
    },
    async submitDeposit(
      {
        rootState: { config, wallet },
        dispatch
      },
      { proposalId, deposit }
    ) {
      // const denom = config.bondingDenom.toLowerCase()

      await dispatch(`submitProposal`, {
        depositer: wallet.address
      })
      setTimeout(async () => {
        dispatch(`getProposalDeposits`, proposalId)
      }, 5000)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
