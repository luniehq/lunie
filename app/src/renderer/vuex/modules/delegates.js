export default ({ node }) => {
  const state = {
    delegates: [],
    loading: false
  }

  const mutations = {
    setDelegateLoading(state, loading) {
      state.loading = loading
    },
    setDelegates(state, delegates) {
      state.delegates = delegates
    },
    addDelegate(state, delegate) {
      delegate.id = delegate.owner
      Object.assign(delegate, delegate.description)

      // TODO: calculate voting power
      delegate.voting_power = delegate.tokens

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
    reconnected({ state, dispatch }) {
      if (state.loading) {
        dispatch("getDelegates")
      }
    },
    async getDelegates({ state, commit }) {
      commit("setDelegateLoading", true)
      let delegates = await node.getValidators()
      let validators = await node.getValidators()
      for (let delegate of delegates) {
        if (validators.find(v => v.pub_key === delegate.pub_key)) {
          delegate.isValidator = true
        }
        commit("addDelegate", delegate)
      }

      commit("setDelegates", delegates)
      commit("setDelegateLoading", false)

      return state.delegates
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
