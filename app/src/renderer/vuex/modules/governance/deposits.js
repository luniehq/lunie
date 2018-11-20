"use strict"

export default ({ node }) => {
  const state = {
    loading: false,
    deposits: {}
  }

  const mutations = {
    setProposalDeposits(state, proposalId, deposits) {
      state.deposits[proposalId] = deposits
    }
  }
  let actions = {
    async getProposalDeposits({ state, commit }, proposalId) {
      state.loading = true
      let deposits = await node.queryProposalDeposits(proposalId)
      commit(`setProposalDeposits`, proposalId, deposits)
      state.loading = false
    },
    async submitDeposit(
      {
        rootState: { wallet },
        dispatch
      },
      { proposal_id, amount }
    ) {
      await dispatch(`sendTx`, {
        type: `submitProposalDeposit`,
        to: proposal_id,
        proposal_id,
        depositer: wallet.address,
        amount
      })
      await dispatch(`getProposalDeposits`, proposal_id)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
