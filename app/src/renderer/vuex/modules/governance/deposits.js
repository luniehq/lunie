"use strict"

export default ({ node }) => {
  const state = {
    loading: false,
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
      let deposits = await node.queryProposalDeposits(proposalId)
      commit(`setProposalDeposits`, proposalId, deposits)
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
      console.log(depositAmount)
      await dispatch(`sendTx`, {
        type: `submitDeposit`,
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
