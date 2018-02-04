import data from '../json/proposals.json'

export default ({ commit }) => {
  const state = {
    items: data,
    loading: false
  }

  const mutations = {
  }
  return { state, mutations }
}
