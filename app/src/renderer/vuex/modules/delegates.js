import axios from 'axios'

export default ({ dispatch, node }) => {
  const state = []

  const mutations = {
    addDelegate (state, delegate) {
      delegate.id = delegate.pub_key.data
      Object.assign(delegate, delegate.description)

      // return if we already have this delegate
      for (let existingDelegate of state) {
        if (existingDelegate.id === delegate.id) {
          Object.assign(existingDelegate, delegate)
          return
        }
      }

      state.push(delegate)
    }
  }

  const actions = {
    async getDelegates ({ dispatch }) {
      let delegatePubkeys = (await node.candidates()).data
      return Promise.all(delegatePubkeys.map(pubkey => {
        return dispatch('getDelegate', pubkey)
      }))
    },
    async getDelegate ({ commit }, pubkey) {
      let delegate = (await axios.get('http://localhost:8998/query/stake/candidate/' + pubkey.data)).data.data
      // TODO move into cosmos-sdk
      // let delegate = (await node.candidate(pubkeyToString(pubkey))).data
      commit('addDelegate', delegate)
      return delegate
    }
  }

  return { state, mutations, actions }
}
