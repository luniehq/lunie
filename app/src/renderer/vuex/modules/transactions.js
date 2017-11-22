import data from '../json/transactions.json'

export default ({ commit, basecoin }) => {
  const state = data
  const mutations = {}
  return { state, mutations }
}
