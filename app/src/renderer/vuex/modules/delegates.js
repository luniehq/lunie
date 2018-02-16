import axios from 'axios'
import indicateValidators from 'scripts/indicateValidators'

export default ({ dispatch, node }) => {
  const state = {
    delegates: [],
    loading: false
  }

  const mutations = {
    addDelegate (state, delegate) {
      delegate.id = delegate.pub_key.data
      Object.assign(delegate, delegate.description)

      // update if we already have this delegate
      for (let existingDelegate of state.delegates) {
        if (existingDelegate.id === delegate.id) {
          Object.assign(existingDelegate, delegate)
          return
        }
      }

      state.delegates.push(delegate)
    }
  }

  const actions = {
    async getDelegates ({ state, dispatch, rootState }) {
      state.loading = true
      let delegatePubkeys = (await node.candidates()).data
      await Promise.all(delegatePubkeys.map(pubkey => {
        return dispatch('getDelegate', pubkey)
      }))
      state.delegates = indicateValidators(state.delegates, rootState.config.maxValidators)
      state.loading = false
      return state.delegates
    },
    async getDelegate ({ commit }, pubkey) {
      let delegate = (await axios.get(`http://localhost:${node.relayPort}/query/stake/candidate/${pubkey.data}`)).data.data
      // TODO move into cosmos-sdk
      // let delegate = (await node.candidate(pubkeyToString(pubkey))).data
      delegate.isValidator = false
      commit('addDelegate', delegate)
      return delegate
    }
  }

  return { state, mutations, actions }
}
