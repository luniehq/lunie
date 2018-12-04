import Raven from "raven-js"

export default ({ node }) => {
  const state = {
    loading: false,
    error: null,
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
      try {
        let deposits = await node.queryProposalDeposits(proposalId)
        state.error = null
        commit(`setProposalDeposits`, proposalId, deposits)
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching deposits on proposals`,
          body: error.message
        })
        Raven.captureException(error)
        state.error = error
      }
      state.loading = false
    },
    async submitDeposit(
      {
        rootState: { wallet },
        dispatch
      },
      { proposal_id, amount, password }
    ) {
      await dispatch(`sendTx`, {
        type: `submitProposalDeposit`,
        to: proposal_id,
        proposal_id,
        depositer: wallet.address,
        amount,
        password
      })
      await dispatch(`getProposalDeposits`, proposal_id)
      await dispatch(`getProposal`, proposal_id)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
