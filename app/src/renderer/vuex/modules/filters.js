export default ({ commit, basecoin }) => {
  const state = {
    balances: {
      search: {
        visible: false,
        query: ''
      }
    },
    candidates: {
      search: {
        visible: false,
        query: ''
      }
    },
    proposals: {
      search: {
        visible: false,
        query: ''
      }
    },
    validators: {
      search: {
        visible: false,
        query: ''
      }
    }
  }
  const mutations = {
    setSearchVisible (state, [type, bool]) {
      state[type].search.visible = bool
    },
    setSearchQuery (state, [type, string]) {
      console.log('setSearchQuery', type, string)
      state[type].search.query = string
    }
  }
  return { state, mutations }
}
