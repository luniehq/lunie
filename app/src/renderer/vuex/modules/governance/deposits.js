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
      } catch (err) {
        commit(`notifyError`, {
          title: `Error fetching deposits on proposals`,
          body: err.message
        })
        Raven.captureException(err)
        state.error = err
      }
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
