import { PubKey } from 'tendermint-crypto'

function pubkeyToString (pubkey) {
  let type = pubkey.type === 'ed25519' ? '01' : '02'
  return type + pubkey.data
}

export default ({ commit, dispatch, node }) => {
  const state = []

  const mutations = {
    addCandidate (state, candidate) {
      candidate.id = pubkeyToString(candidate.pubkey)

      // return if we already have this candidate
      for (let existingCandidate of state) {
        if (existingCandidate.id === candidate.id) return
      }

      state.push(candidate)
    }
  }

  const actions = {
    async getCandidates ({ commit }) {
      let candidatePubkeys = (await node.candidates()).data
      for (let pubkey of candidatePubkeys) {
        dispatch('getCandidate', pubkey)
      }
    },
    async getCandidate ({ commit }, pubkey) {
      let candidate = (await node.candidate(pubkeyToString(pubkey))).data
      commit('addCandidate', candidate)
    }
  }

  setTimeout(() => dispatch('getCandidates'), 1000)

  return { state, mutations, actions }
}
