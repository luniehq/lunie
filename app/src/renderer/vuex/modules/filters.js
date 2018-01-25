export default ({ commit }) => {
  const state = {
    balances: {
      search: {
        visible: false,
        query: ''
      }
    },
    blocks: {
      search: {
        visible: false,
        query: ''
      }
    },
    delegates: {
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
    transactions: {
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
    resetSearch (state, type) {
      state[type].search.visible = false
      state[type].search.query = ''
    },
    setSearchVisible (state, [type, bool]) {
      state[type].search.visible = bool
    },
    setSearchQuery (state, [type, string]) {
      state[type].search.query = string
    }
  }
  return { state, mutations }
}
