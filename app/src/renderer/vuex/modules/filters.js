export default ({ commit, basecoin }) => {
  const state = {
    delegators: {
      search: {
        visible: false,
        query: ''
      },
      sort: {
        visible: false,
        query: ''
      }
    },
    proposals: {
      search: {
        visible: false,
        query: ''
      },
      sort: {
        visible: false,
        query: ''
      }
    },
    validators: {
      search: {
        visible: false,
        query: ''
      },
      sort: {
        visible: false,
        query: ''
      }
    }
  }
  const mutations = {
    setDelegatorSearchVisible (state, v) { state.delegators.search.visible = v },
    setDelegatorSearchQuery (state, v) { state.delegators.search.query = v },

    setProposalsSearchVisible (state, v) { state.proposals.search.visible = v },
    setProposalsSearchQuery (state, v) { state.proposals.search.query = v },

    setValidatorSearchVisible (state, v) { state.validators.search.visible = v },
    setValidatorSearchQuery (state, v) { state.validators.search.query = v }
  }
  return { state, mutations }
}
