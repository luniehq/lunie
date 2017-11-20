export default ({ commit, node }) => {
  const state = {
    blockchainName: 'mercury',
    validators: {}
  }

  const mutations = {
    setValidatorBlockchainName (state, name) {
      state.blockchainName = name
    },
    setValidators (state, validators) {
      state.validators = validators
    }
  }

  function getValidators () {
    // retrieve peer validators (of validator01)
    node.rpc.validators((err, data) => {
      if (err) return console.error(err)
      commit('setValidators', data.validators)
    })
  }

  setInterval(() => getValidators(), 1000)

  return { state, mutations }
}
