export default ({ commit, node }) => {
  const state = {
    validators: {},
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
    maybeUpdateValidators ({state, commit}, header) {
      let validatorHash = header.validators_hash
      if (validatorHash === state.validatorHash) return
      commit('setValidatorHash', validatorHash)
      getValidators()
    }
  }

  function getValidators () {
    node.rpc.validators((err, { validators }) => {
      if (err) return console.error('error fetching validator set')
      commit('setValidators', validators)
    })
  }
  getValidators()

  return { state, mutations, actions }
}
