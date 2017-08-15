import data from '../json/delegators.json'

export default ({ commit, basecoin }) => {
  const state = data
  const mutations = {}
  return { state, mutations }
}
