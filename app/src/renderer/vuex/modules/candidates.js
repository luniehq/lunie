import data from '../json/candidates.json'

export default ({ commit, basecoin }) => {
  const state = data
  const mutations = {}

  return { state, mutations }
}
