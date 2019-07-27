export default ({ node }) => {
  const emptyState = {
    pool: {},
    loading: false,
    loaded: false,
    error: null
  }
  const state = {
    ...emptyState
  }
  const mutations = {
    setInflation(state, inflation) {
      state.inflation = inflation
    },
    setAnnualProvision(state, annualProvision) {
      state.annualProvision = annualProvision
    },
    setMintingParameters(state, parameters) {
      state.parameters = parameters
    }
  }

  const actions = {
    async getMintingParameters({ commit }) {
      state.loading = true
      try {
        await Promise.all([
          node.get
            .mintingParameters()
            .then(parameters => commit("setMintingParameters", parameters)),
          node.get
            .inflation()
            .then(parseFloat)
            .then(inflation => commit("setInflation", inflation)),
          node.get
            .annualProvisionedTokens()
            .then(parseFloat)
            .then(provision => commit("setAnnualProvision", provision))
        ])
        state.loaded = true
      } catch (error) {
        state.error = error
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
