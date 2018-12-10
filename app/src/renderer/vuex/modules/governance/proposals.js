import * as Sentry from "@sentry/browser"
import Vue from "vue"

export default ({ node }) => {
  let emptyState = {
    loading: false,
    loaded: false,
    error: null,
    proposals: {}
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setProposal(state, proposal) {
      Vue.set(state.proposals, proposal.proposal_id, proposal)
    },
    setProposalTally(state, proposalId, tally) {
      state.proposals[proposalId].tally_result = tally
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
    async getProposals({ state, commit, rootState }) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        let proposals = await node.queryProposals()
        if (proposals.length > 0) {
          proposals.forEach(proposal => {
            commit(`setProposal`, proposal.value)
            // the proposal doesn't hold the tally results until it's inactive (rejected or passed)
            // TODO: enable after upgrading to latest SDK
            // if (proposal.value.proposal_status === `VotingPeriod`) {
            //   node.queryProposalTally(proposal.value.proposal_id).then(tally => {
            //     commit(`setProposalTally`, proposal.value.proposal_id, tally)
            //   })
            // }
          })
        }
        state.error = null
        state.loading = false
        state.loaded = true
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching proposals`,
          body: error.message
        })
        Sentry.captureException(error)
        state.error = error
      }
    },
    async getProposal({ state, commit }, proposal_id) {
      state.loading = true
      try {
        state.error = null
        state.loading = false
        state.loaded = true // TODO make state for only proposal
        let proposal = await node.queryProposal(proposal_id)
        commit(`setProposal`, proposal.value)
      } catch (error) {
        commit(`notifyError`, {
          title: `Error querying proposal with id #${proposal_id}`,
          body: error.message
        })
        Sentry.captureException(error)
        state.error = error
      }
    },
    async submitProposal(
      {
        rootState: { wallet },
        dispatch
      },
      { title, description, type, initial_deposit, password }
    ) {
      await dispatch(`sendTx`, {
        type: `submitProposal`,
        proposer: wallet.address,
        proposal_type: type,
        title,
        description,
        initial_deposit,
        password
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
