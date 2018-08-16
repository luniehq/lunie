export default ({ node }) => {
  const emptyState = {
    delegates: [],
    loading: false
  }
  const state = JSON.parse(JSON.stringify(emptyState))

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
      let divIdx = delegate.tokens.indexOf("/")
      let tokens
      if (divIdx == -1) {
        tokens = Number(delegate.tokens)
      } else {
        tokens =
          Number(delegate.tokens.substring(0, divIdx)) /
          Number(delegate.tokens.substring(divIdx + 1))
      }
      delegate.voting_power = tokens.toFixed(2)

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
    resetSessionData({ rootState }) {
      rootState.delegates = JSON.parse(JSON.stringify(emptyState))
    },
    async getDelegates({ state, commit }) {
      commit("setDelegateLoading", true)
      let candidates = await node.getCandidates()
      let { validators } = await node.getValidatorSet()
      for (let delegate of candidates) {
        if (validators.find(v => v.pub_key === delegate.pub_key)) {
          delegate.isValidator = true
        }
        commit("addDelegate", delegate)
      }

      commit("setDelegates", candidates)
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
