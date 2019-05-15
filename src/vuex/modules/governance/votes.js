import Vue from "vue"
import * as Sentry from "@sentry/browser"

export default ({ node }) => {
  const state = {
    loading: false,
    loaded: false,
    error: null,
    votes: {}
  }

  const mutations = {
    setProposalVotes(state, { proposalId, votes }) {
      Vue.set(state.votes, proposalId, votes)
    }
  }
  const actions = {
    async getProposalVotes({ state, commit, rootState }, proposalId) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        const votes = await node.get.proposalVotes(proposalId)
        commit(`setProposalVotes`, { proposalId, votes })
        state.error = null
        state.loading = false
        state.loaded = true
      } catch (error) {
        Sentry.captureException(error)
        state.error = error
      }
    },
    async simulateVote({ dispatch }, { proposal_id, option }) {
      return await dispatch(`simulateTx`, {
        type: `MsgVote`,
        txArguments: {
          proposalId: proposal_id,
          option
        }
      })
    },
    async submitVote(
      { dispatch },
      { proposal_id, option, gas, gas_prices, password, submitType }
    ) {
      await dispatch(`sendTx`, {
        type: `MsgVote`,
        txArguments: {
          proposalId: proposal_id,
          option
        },
        gas,
        gas_prices,
        password,
        submitType
      })
      await dispatch(`getProposalVotes`, proposal_id)
      await dispatch(`getProposal`, proposal_id)
      await dispatch(`getAllTxs`)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
