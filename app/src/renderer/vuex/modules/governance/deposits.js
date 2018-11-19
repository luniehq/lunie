"use strict"

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
        console.error(err)
        state.error = err
      }
      state.loading = false
    },
    async submitDeposit(
      {
        rootState: { config, wallet },
        dispatch
      },
      proposalId,
      depositAmount
    ) {
      const denom = config.bondingDenom.toLowerCase()
      await dispatch(`sendTx`, {
        type: `submitProposalDeposit`,
        proposal_id: proposalId,
        depositer: wallet.address,
        amount: [
          {
            denom: denom,
            amount: depositAmount
          }
        ]
      })
      setTimeout(async () => {
        dispatch(`getProposalDeposits`, proposalId)
      }, 5000)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
