import data from '../json/candidates.json'

export default ({ commit, basecoin }) => {
  const state = data

  const mutations = {
    updateCandidate (state, candidate) {
      // TODO: replace hardcoded defaults with real data
      candidate.computed = {
        delegators: 10,
        atoms: 31337,
        pubkey: 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDZ67wzRdjbTb9HxduU9YQd9',
        slashes: []
      }
      state.splice(state.indexOf(
        state.find(c => c.id === candidate.id)), 1, candidate)

      commit('notifyCustom', { title: 'Nomination Updated',
        body: 'You have successfuly updated your candidacy.' })
    },
    addCandidate (state, candidate) {
      // TODO: replace hardcoded defaults with real data
      candidate.computed = {
        delegators: 10,
        atoms: 31337,
        pubkey: 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDZ67wzRdjbTb9HxduU9YQd9',
        slashes: []
      }
      state.push(candidate)
      commit('notifyCustom', { title: 'Nomination Submitted',
        body: 'Well done! You\'ll appear on the candidates list shortly .' })
    }
  }

  return { state, mutations }
}
