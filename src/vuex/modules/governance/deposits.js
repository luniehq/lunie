export default () => {
  const state = {}

  const mutations = {}
  const actions = {
    async postMsgDeposit(
      { dispatch },
      {
        txProps: { proposalId }
      }
    ) {
      // TODO update apollo for proposal
      await dispatch(`getAllTxs`)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
