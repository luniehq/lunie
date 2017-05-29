import data from '../json/validators.json'

export default ({ commit, basecoin }) => {
  const state = data
  const mutations = {}

  return { state, mutations }
}
