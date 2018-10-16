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
    async getProposals({ state, commit, dispatch }) {
      state.loading = true
      let proposals = await node.queryProposals()
      if (proposals.length > 0) {
        proposals.forEach(proposal => {
          let proposalId = Number(proposal.proposal_id)
          if (
            state.proposals[proposalId] &&
            state.proposals[proposalId].proposal_id === proposalId &&
            state.proposals[proposalId] !== proposal
          ) {
            commit(`setProposal`, proposal)
            dispatch(`getVotes`, proposalId)
            // TODO disable when upgrade gaia to SDK develop or v.0.25
            // dispatch(`getDeposits`, proposalId)
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
