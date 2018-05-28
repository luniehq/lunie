import indicateValidators from "scripts/indicateValidators"

export default ({ dispatch, node }) => {
  const state = {
    delegates: [],
    loading: false
  }

  const mutations = {
    addDelegate(state, delegate) {
      delegate.id = delegate.owner
      Object.assign(delegate, delegate.description)

      // TODO: calculate voting power
      delegate.voting_power = parseRat(delegate.pool_shares.amount)

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
    async getDelegates({ state, dispatch, commit, rootState }) {
      state.loading = true
      let delegates = await node.candidates()
      for (let delegate of delegates) {
        commit("addDelegate", delegate)
      }
      state.delegates = indicateValidators(
        state.delegates,
        rootState.config.maxValidators
      )
      state.loading = false
      return state.delegates
    }
  }

  return {
    state,
    mutations,
    actions
  }
}

// parse sdk rational number string
function parseRat(ratStr) {
  let [numerator, denominator] = ratStr.split("/")
  return +numerator / +denominator
}
