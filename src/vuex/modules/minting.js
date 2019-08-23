export default ({ node }) => {
  const emptyState = {
    pool: {},
    annualProvision: null,
    loading: false,
    loaded: false,
    error: null
  }
  const state = {
    ...emptyState
  }
  const mutations = {
    setAnnualProvision(state, annualProvision) {
      state.annualProvision = annualProvision
    }
  }

  const actions = {
    async getMintingParameters({ state, commit, rootState }) {
      if (!rootState.connection.connected || state.loaded) return

      state.loading = true
      try {
        await Promise.all([
          node.get
            .annualProvisionedTokens()
            .then(parseFloat)
            .then(provision => commit("setAnnualProvision", provision))
        ])
        state.loaded = true
      } catch (error) {
        state.error = error.message
      }
      state.loading = false
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
