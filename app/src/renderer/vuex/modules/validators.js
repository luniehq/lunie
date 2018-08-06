import b32 from "scripts/b32"

export default ({ node }) => {
  const state = {
    validators: [],
    loading: false,
    validatorHash: null
  }

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
        dispatch("getValidators")
      }
    },
    async getValidators({ state, commit }) {
      state.loading = true
      try {
        let candidates = await node.getValidatorSet()
        commit("setValidators", candidates)
      } catch (err) {
        commit("notifyError", {
          title: "Error fetching validator set",
          body: err.message
        })
      }
      state.loading = false
    },
    maybeUpdateValidators({ state, commit, dispatch }, header) {
      let validatorHash = header.validators_hash
      if (validatorHash === state.validatorHash) return
      commit("setValidatorHash", validatorHash)
      dispatch("getValidators")
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
