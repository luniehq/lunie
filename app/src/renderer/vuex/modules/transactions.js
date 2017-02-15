import data from '../json/transactions.json'

export default (opts) => {
  const state = data
  const mutations = {}
  return {
    state,
    mutations
  }
}
