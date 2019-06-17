export default ({ node }) => {
  const state = {
    node
  }

  const mutations = {}

  const actions = {
    postSubmitSend({ state, commit, rootState, getters }, { txProps, txMeta }) {
      const { toAddress } = txProps
      const { gasEstimate, gasPrice } = txMeta
      const fees = gasEstimate * gasPrice

      // if we send to ourselves, we don't loose tokens
      const liquidityChangeAmount =
        toAddress === rootState.session.address ? 0 : txProps.amounts[0].amount

      commit("updateWalletBalance", {
        amount: getters.liquidAtoms - liquidityChangeAmount - fees,
        denom: state.bondDenom
      })
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
