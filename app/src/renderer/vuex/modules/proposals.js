import data from '../json/proposals.json'

export default ({ commit }) => {
  const state = {
    items: data,
    loading: false
  }

  const mutations = {}
  const actions = {
    reconnected ({ state, dispatch }) {
      if (state.loading) {
        // dispatch('queryProposals')
      }
    }
  }
  return {
    state, actions, mutations
  }
}
