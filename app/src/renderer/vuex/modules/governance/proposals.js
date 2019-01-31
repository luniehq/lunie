import * as Sentry from "@sentry/browser"
import Vue from "vue"

export default ({ node }) => {
  const emptyState = {
    loading: false,
    loaded: false,
    error: null,
    proposals: {},
    tallies: {}
  }
  const state = JSON.parse(JSON.stringify(emptyState))
  const mutations = {
    setProposal(state, proposal) {
      Vue.set(state.proposals, proposal.proposal_id, proposal)
    },
    setProposalTally(state, { proposal_id, final_tally_result }) {
      Vue.set(state.tallies, proposal_id, final_tally_result)
    }
  }
  const actions = {
    async reconnected({ state, dispatch }) {
      if (state.loading) {
        await dispatch(`getProposals`)
      }
    },
    resetSessionData({ rootState }) {
      rootState.proposals = JSON.parse(JSON.stringify(emptyState))
    },
    async getProposals({ state, commit, rootState }) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        let final_tally_result
        const proposals = await node.queryProposals()
        if (proposals.length > 0) {
          await Promise.all(
            proposals.map(async proposal => {
              commit(`setProposal`, proposal.value)
              if (proposal.value.proposal_status === `VotingPeriod`) {
                final_tally_result = await node.getProposalTally(
                  proposal.value.proposal_id
                )
              } else {
                final_tally_result = JSON.parse(
                  JSON.stringify(proposal.value.final_tally_result)
                )
              }
              commit(`setProposalTally`, {
                proposal_id: proposal.value.proposal_id,
                final_tally_result
              })
            })
          )
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
        let final_tally_result
        state.error = null
        state.loading = false
        state.loaded = true // TODO make state for single proposal
        const proposal = await node.queryProposal(proposal_id)
        commit(`setProposal`, proposal.value)
        if (proposal.value.proposal_status === `VotingPeriod`) {
          final_tally_result = await node.getProposalTally(
            proposal.value.proposal_id
          )
        } else {
          final_tally_result = JSON.parse(
            JSON.stringify(proposal.value.final_tally_result)
          )
        }
        commit(`setProposalTally`, { proposal_id, final_tally_result })
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
      { title, description, type, initial_deposit, password, submitType }
    ) {
      await dispatch(`sendTx`, {
        type: `submitProposal`,
        proposer: wallet.address,
        proposal_type: type,
        title,
        description,
        initial_deposit,
        password,
        submitType
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
