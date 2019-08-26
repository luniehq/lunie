import Vue from "vue"
import BigNumber from "bignumber.js"

export const setProposalTally = (commit, node) => async proposal => {
  commit(`setProposal`, proposal)
  const final_tally_result =
    proposal.proposal_status === `VotingPeriod`
      ? await node.get.proposalTally(proposal.id)
      : { ...proposal.final_tally_result }
  commit(`setProposalTally`, {
    id: proposal.id,
    final_tally_result
  })
}

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
      Vue.set(state.proposals, proposal.id, proposal)
    },
    setProposalTally(state, { id, final_tally_result }) {
      Vue.set(state.tallies, id, final_tally_result)
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
        const proposals = await node.get.proposals()
        if (proposals.length > 0) {
          await Promise.all(proposals.map(setProposalTally(commit, node)))
        }

        state.error = null
        state.loaded = true
        state.loading = false
      } catch (error) {
        state.error = error
      }
    },
    async getProposal({ state, commit }, id) {
      state.loading = true
      try {
        const proposal = await node.get.proposal(id)
        await setProposalTally(commit, node)(proposal)
        state.error = null
        state.loaded = true
        state.loading = false
        return proposal
      } catch (error) {
        state.error = error
      }
      return undefined
    },
    async postMsgSubmitProposal(
      {
        state,
        rootState: { wallet },
        dispatch,
        commit
      },
      {
        txProps: { initialDeposits, title, description }
      }
    ) {
      // optimistic updates
      initialDeposits.forEach(({ amount, denom }) => {
        const oldBalance = wallet.balances.find(
          balance => balance.denom === denom
        )
        commit(`updateWalletBalance`, {
          denom,
          amount: BigNumber(oldBalance.amount)
            .minus(amount)
            .toNumber()
        })
      })

      const latestId = Object.keys(state.proposals).reduce((latest, id) => {
        return latest > Number(id) ? latest : Number(id)
      }, 0)

      commit(`setProposal`, {
        id: String(latestId + 1),
        content: {
          value: { title, description }
        },
        initial_deposit: initialDeposits
      })

      await dispatch(`getProposals`)
      await dispatch(`getAllTxs`)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
