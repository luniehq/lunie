"use strict"

export default ({ node }) => {
  let emptyState = {
    loading: false,
    proposals: []
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  // TODO get deposits?
  const mutations = {
    setProposal(state, proposal) {
      const proposalID = Number(proposal.proposal_id)
      if (state.proposals.length >= proposalID) {
        state.proposals.push(proposal)
      } else {
        state.proposals[proposalID] = proposal
      }
    },
    // Double check
    setProposals(state, proposals) {
      state.proposals = proposals
    }
  }
  const actions = {
    reconnected({ state, dispatch }) {
      if (state.loading) {
        dispatch(`getProposals`)
      }
    },
    resetSessionData({ rootState }) {
      rootState.proposals = JSON.parse(JSON.stringify(emptyState))
    },
    async getProposals({ state, commit }) {
      state.loading = true
      let proposals = await node.queryProposals()
      if (proposals.length > 0) {
        commit(`setProposals`, proposals)
      }
      state.loading = false
    },
    async getProposal({ state, commit }, proposalId) {
      state.loading = true
      let proposal = await node.queryProposal(proposalId)
      if (proposal) {
        commit(`setProposals`, proposal)
      }
      state.loading = false
    },
    async submitProposal(
      {
        rootState: { config, wallet },
        dispatch
      },
      { proposal }
    ) {
      const denom = config.bondingDenom.toLowerCase()

      await dispatch(`sendTx`, {
        type: `submitProposal`,
        proposer: wallet.address,
        proposal_type: proposal.type,
        title: proposal.title,
        description: proposal.description,
        initial_deposit: [
          {
            denom,
            amount: proposal.deposit
          }
        ]
      })
      setTimeout(async () => {
        dispatch(`getProposals`)
      }, 5000)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
