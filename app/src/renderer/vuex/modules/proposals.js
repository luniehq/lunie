import data from "../json/proposals.json"

export default () => {
  const state = {
    items: data,
    loading: false
  }

  const mutations = {}
  const actions = {
    reconnected({ state }) {
      if (state.loading) {
        // dispatch('queryProposals')
      }
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
