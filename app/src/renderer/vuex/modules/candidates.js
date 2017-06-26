const CANDIDATE_INTERVAL = 1000 // update every second

export default ({ commit, node }) => {
  const state = {
    list: [],
    map: {}
  }

  const mutations = {
    updateCandidate (state, candidate) {
      // TODO: replace hardcoded defaults with real data
      candidate.computed = {
        delegators: 10,
        atoms: 31337,
        pubkey: 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDZ67wzRdjbTb9HxduU9YQd9',
        slashes: []
      }
      state.list.splice(state.list.indexOf(
        state.list.find(c => c.keybaseID === candidate.keybaseID)), 1, candidate)

      // commit('notifyCustom', { title: 'Nomination Updated',
      //   body: 'You have successfuly updated your candidacy.' })
    },
    addCandidate (state, candidate) {
      let pubkey = candidate.validatorPubKey.bytes().toString('base64')
      if (state.map[pubkey] != null) return

      candidate.computed = {
        delegators: 10,
        atoms: 31337,
        pubkey: 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDZ67wzRdjbTb9HxduU9YQd9',
        slashes: []
      }
      state.list.push(candidate)
      state.map[pubkey] = candidate

      // TODO: move the notification to the nomination component
      // commit('notifyCustom', { title: 'Nomination Submitted',
      //   body: 'Well done! You\'ll appear on the candidates list shortly .' })
    }
  }

  const actions = {
    async getCandidates ({ commit }) {
      let candidates = await node.delegationGame.getCandidates()
      candidates.forEach((c) => commit('addCandidate', c))
    },
    startCandidateInterval ({ dispatch }) {
      setInterval(() => dispatch('getCandidates'), CANDIDATE_INTERVAL)
    },
    async nominateCandidate ({ commit }, candidate) {
      await node.delegationGame.nominate(candidate, node.wallet)
    }
  }

  return { state, mutations, actions }
}
