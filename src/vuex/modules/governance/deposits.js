import Vue from "vue"

export default ({ node }) => {
  const state = {
    loading: false,
    error: null,
    loaded: false,
    deposits: {}
  }

  const mutations = {
    setProposalDeposits(state, proposalId, deposits) {
      Vue.set(state.deposits, proposalId, deposits)
    }
  }
  const actions = {
    async getProposalDeposits({ state, commit, rootState }, proposalId) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        const deposits = await node.get.proposalDeposits(proposalId)
        state.error = null
        state.loading = false
        state.loaded = true
        commit(`setProposalDeposits`, proposalId, deposits)
      } catch (error) {
        state.error = error
      }
    },
    async postMsgDeposit(
      {
        rootState: { wallet },
        dispatch,
        commit
      },
      {
        txProps: { proposalId, amounts }
      }
    ) {
      // optimistic update
      amounts.forEach(({ amount, denom }) => {
        const oldBalance = wallet.balances.find(
          balance => balance.denom === denom
        )
        commit(`updateWalletBalance`, {
          denom,
          amount: oldBalance.amount - amount
        })
      })

      await dispatch(`getProposalDeposits`, proposalId)
      await dispatch(`getProposal`, proposalId)
      await dispatch(`getAllTxs`)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
