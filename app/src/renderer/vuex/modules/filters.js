export default ({ commit, basecoin }) => {
  const state = {
    candidates: {
      search: {
        visible: false,
        query: ''
      },
      sort: {
        visible: false,
        query: ''
      }
    },
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
    setCandidateSearchVisible (state, v) { state.candidates.search.visible = v },
    setCandidateSearchQuery (state, v) { state.candidates.search.query = v },

    setDelegatorsSearchVisible (state, v) { state.delegators.search.visible = v },
    setDelegatorsSearchQuery (state, v) { state.delegators.search.query = v },

    setProposalsSearchVisible (state, v) { state.proposals.search.visible = v },
    setProposalsSearchQuery (state, v) { state.proposals.search.query = v },

    setValidatorsSearchVisible (state, v) { state.validators.search.visible = v },
    setValidatorsSearchQuery (state, v) { state.validators.search.query = v }
  }
  return { state, mutations }
}
