export default () => {
  const emptyState = {}
  const state = JSON.parse(JSON.stringify(emptyState))
  const mutations = {}

  const actions = {
    async postMsgSubmitProposal({ dispatch }) {
      // await dispatch(`getProposals`) // TODO refresh apollo
      await dispatch(`getAllTxs`)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
