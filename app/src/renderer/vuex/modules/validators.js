export default ({ node }) => {
  const state = {
    validators: {},
    loading: false,
    validatorHash: null
  }

  const mutations = {
    setValidators (state, validators) {
      state.validators = validators
    },
    setValidatorHash (state, validatorHash) {
      state.validatorHash = validatorHash
    }
  }

  const actions = {
    getValidators ({state, commit}) {
      state.loading = true
      node.rpc.validators((err, { validators } = {}) => {
        if (err) return console.error('error fetching validator set')
        commit('setValidators', validators)
        state.loading = false
      })
    },
    maybeUpdateValidators ({state, commit, dispatch}, header) {
      let validatorHash = header.validators_hash
      if (validatorHash === state.validatorHash) return
      commit('setValidatorHash', validatorHash)
      dispatch('getValidators')
    }
  }

  return { state, mutations, actions }
}
