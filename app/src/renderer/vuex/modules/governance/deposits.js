import * as Sentry from "@sentry/browser"
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
        const deposits = await node.getProposalDeposits(proposalId)
        state.error = null
        state.loading = false
        state.loaded = true
        commit(`setProposalDeposits`, proposalId, deposits)
      } catch (error) {
        Sentry.captureException(error)
        state.error = error
      }
    },
    async submitDeposit(
      {
        rootState: { wallet },
        dispatch,
        commit
      },
      { proposal_id, amount: deposit, password, submitType }
    ) {
      await dispatch(`sendTx`, {
        type: `postProposalDeposit`,
        to: proposal_id,
        proposal_id,
        depositor: wallet.address,
        amount: deposit,
        password,
        submitType
      })

      // optimistic update
      deposit.forEach(({ amount, denom }) => {
        const oldBalance = wallet.balances
          .find(balance => balance.denom === denom)
        commit(`updateWalletBalance`, {
          denom,
          amount: oldBalance.amount - amount
        })
      })

      await dispatch(`getProposalDeposits`, proposal_id)
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
