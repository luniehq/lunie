import Raven from "raven-js"

export default ({ node }) => {
  const emptyState = {
    validators: [],
    loading: false,
    loaded: false,
    error: null,
    validatorHash: null
  }
  let state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setValidators(state, validators) {
      state.validators = validators
    },
    setValidatorHash(state, validatorHash) {
      state.validatorHash = validatorHash
    }
  }

  const actions = {
    reconnected({ state, dispatch }) {
      if (state.loading) {
        dispatch(`getValidators`)
      }
    },
    resetSessionData({ rootState }) {
      // clear previous account state
      rootState.validators = JSON.parse(JSON.stringify(emptyState))
    },
    async getValidators({ state, commit, rootState }) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        let validators = (await node.getValidatorSet()).validators
        state.error = null
        state.loading = false
        state.loaded = true
        commit(`setValidators`, validators)
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching validator set`,
          body: error.message
        })
        Raven.captureException(error)
        state.error = error
      }
    },
    async maybeUpdateValidators({ state, commit, dispatch }, header) {
      let validatorHash = header.validators_hash
      if (validatorHash === state.validatorHash) return
      commit(`setValidatorHash`, validatorHash)
      await dispatch(`getValidators`)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
