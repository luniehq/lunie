export default () => {
  const emptyState = {
    balances: {
      search: {
        visible: false,
        query: ""
      }
    },
    blocks: {
      search: {
        visible: false,
        query: ""
      }
    },
    delegates: {
      search: {
        visible: false,
        query: ""
      }
    },
    proposals: {
      search: {
        visible: false,
        query: ""
      }
    },
    transactions: {
      search: {
        visible: false,
        query: ""
      }
    },
    validators: {
      search: {
        visible: false,
        query: ""
      }
    }
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    resetSearch(state, type) {
      state[type].search.visible = false
      state[type].search.query = ""
    },
    setSearchVisible(state, [type, bool]) {
      state[type].search.visible = bool
    },
    setSearchQuery(state, [type, string]) {
      state[type].search.query = string
    }
  }

  const actions = {
    resetSessionData({ rootState }) {
      rootState.filters = JSON.parse(JSON.stringify(emptyState))
    }
  }
  return { state, mutations, actions }
}
