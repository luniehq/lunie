function pubkeyToString (pubkey) {
  // go-wire key encoding,
  // ed25519 keys prefixed w/ 01, secp256k1 w/ 02
  let type = pubkey.type === 'ed25519' ? '01' : '02'
  return type + pubkey.data
}

export default ({ dispatch, node }) => {
  const state = []

  const mutations = {
    addDelegate (state, delegate) {
      delegate.id = pubkeyToString(delegate.pubkey)
      Object.assign(delegate, JSON.parse(delegate.description))

      // return if we already have this delegate
      for (let existingDelegate of state) {
        if (existingDelegate.id === delegate.id) return
      }

      state.push(delegate)
    }
  }

  const actions = {
    async getDelegates ({ dispatch }) {
      let delegatePubkeys = (await node.candidates()).data
      for (let pubkey of delegatePubkeys) {
        dispatch('getDelegate', pubkey)
      }
    },
    async getDelegate ({ commit }, pubkey) {
      let delegate = (await node.candidate(pubkeyToString(pubkey))).data
      commit('addDelegate', delegate)
    }
  }

  setTimeout(() => dispatch('getDelegates'), 1000)

  return { state, mutations, actions }
}
