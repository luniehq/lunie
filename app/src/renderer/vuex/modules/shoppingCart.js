import axios from 'axios'

export default ({ commit }) => {
  let state = { delegates: [] }

  const mutations = {
    addToCart (state, delegate) {
      state.delegates.push({
        id: delegate.id,
        delegate: Object.assign({}, delegate),
        atoms: 0
      })
    },
    removeFromCart (state, delegate) {
      state.delegates = state.delegates.filter(c => c.id !== delegate)
    },
    reserveAtoms (state, {delegateId, value}) {
      state.delegates.find(d => d.id === delegateId).reservedAtoms = value
    },
    setShares (state, {candidateId, value}) {
      state.delegates.find(c => c.id === candidateId).atoms = value
    }
  }

  let actions = {
    async getBondedDelegates ({ state, dispatch }, {candidates, address}) {
      // TODO move into cosmos-sdk
      candidates.forEach(candidate => {
        commit('addToCart', candidate)
        dispatch('getBondedDelegate', {address, pubkey: candidate.pub_key.data})
      })
    },
    async getBondedDelegate ({ commit }, {address, pubkey}) {
      // TODO move into cosmos-sdk
      let bond = (await axios.get('http://localhost:8998/query/stake/delegator/' + address + '/' + pubkey)).data.data
      commit('setShares', {candidateId: bond.PubKey.data, value: bond.Shares})
    }
  }

  return { state, mutations, actions }
}
