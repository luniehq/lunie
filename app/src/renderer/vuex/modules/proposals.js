import data from '../json/proposals.json'

export default ({ commit, basecoin }) => {
  const state = data
  const mutations = {
    ADD_PROPOSAL (state, proposal) {
      proposal.created_at = Date.now()
      state.push(proposal)
      console.log('creating', JSON.stringify(proposal))
    },
    RM_PROPOSAL (state, proposal) {
      state.splice(state.indexOf(proposal), 1)
      console.log('removing', JSON.stringify(proposal))
    }
    /*
    UPDATE_PROPOSAL (state, proposal) {
      console.log('modifying', JSON.stringify(proposal))
      Proposals.child(proposal.id).update({
        body: proposal.body,
        updated_at: new Date.now()
      })
    }
    */
  }
  return { state, mutations }
}
