import { PubKey } from 'tendermint-crypto'

const CANDIDATE_INTERVAL = 1000 // update every second

export default ({ commit, node }) => {
  const state = {
    list: [],
    map: {}
  }

  const mutations = {
    updateCandidate (state, candidate) {
      let pubkey = PubKey.encode(candidate.validatorPubKey).toString('base64')

      // TODO: replace hardcoded defaults with real data
      candidate.computed = {
        // delegators: 10,
        // atoms: candidate.ownCoinsBonded + candidate.coindBonded,
        pubkey,
        slashes: []
      }
      candidate.atoms = candidate.ownCoinsBonded + candidate.coindBonded

      state.list.splice(state.list.indexOf(
        state.list.find(c => c.id === candidate.id)), 1, candidate)

      state.map[pubkey] = candidate

      // commit('notifyCustom', { title: 'Nomination Updated',
      //   body: 'You have successfuly updated your candidacy.' })
    },
    addCandidate (state, candidate) {
      let pubkey = PubKey.encode(candidate.validatorPubKey).toString('base64')
      if (state.map[pubkey] != null) return

      candidate.id = pubkey
      candidate.computed = {
        // delegators: 10,
        // atoms: candidate.ownCoinsBonded + candidate.coindBonded,
        pubkey,
        slashes: []
      }
      candidate.atoms = candidate.ownCoinsBonded + candidate.coinsBonded
      state.list.push(candidate)
      state.map[pubkey] = candidate

      console.log('new candidate', candidate)
    }
  }

  const actions = {
    async getCandidates ({ commit }) {
      let candidates = await node.delegationGame.getCandidates()
      candidates.forEach((c) => commit('addCandidate', c))
    },
    startCandidateInterval ({ dispatch }) {
      // TODO: use tx events instead of polling
      setInterval(() => dispatch('getCandidates'), CANDIDATE_INTERVAL)
    },
    async nominateCandidate ({ commit }, candidate) {
      await node.delegationGame.nominate(candidate, node.wallet)
    }
  }

  return { state, mutations, actions }
}
