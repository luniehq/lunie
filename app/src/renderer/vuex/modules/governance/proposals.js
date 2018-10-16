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
      state.proposals[proposal.proposal_id] = proposal
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
        proposals.forEach(proposal => {
          let proposalID = Number(proposal.proposal_id)
          if (
            state.proposals[proposalID] &&
            state.proposals[proposalID].proposal_id === proposalID &&
            state.proposals[proposalID] !== proposal
          ) {
            commit(`setProposal`, proposal)
          }
        })
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
