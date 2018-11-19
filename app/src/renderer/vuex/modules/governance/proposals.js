"use strict"

export default ({ node }) => {
  let emptyState = {
    loading: false,
    proposals: {}
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setProposal(state, proposal) {
      state.proposals[proposal.proposal_id] = proposal
    }
  }
  let actions = {
    async reconnected({ state, dispatch }) {
      if (state.loading) {
        await dispatch(`getProposals`)
      }
    },
    resetSessionData({ rootState }) {
      // clear previous account state
      rootState.proposals = JSON.parse(JSON.stringify(emptyState))
    },
    async getProposals({ state, commit }) {
      state.loading = true
      let proposals = await node.queryProposals()
      if (proposals.length > 0) {
        proposals.forEach(proposal => {
          commit(`setProposal`, proposal.value)
        })
      }
      state.loading = false
    },
    async submitProposal(
      {
        rootState: { wallet },
        dispatch
      },
      { title, description, type, initial_deposit }
    ) {
      await dispatch(`sendTx`, {
        type: `submitProposal`,
        proposer: wallet.address,
        proposal_type: type,
        title,
        description,
        initial_deposit
      })
      await dispatch(`getProposals`)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
