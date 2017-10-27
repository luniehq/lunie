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
    node.rpc.status((err, status) => {
      if (err) return console.error(err)
      let height = status.latest_block_height
      node.rpc.validators({ height }, (err, { validators }) => {
        if (err) return console.error(err)
        commit('setValidators', validators)
      })
    })
  }

  setInterval(() => getValidators(), 1000)

  return { state, mutations }
}
