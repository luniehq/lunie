export default ({ commit, basecoin }) => {
  const state = {
    status: false,
    validatorId: ''
  }

  const mutations = {
    stake (state, validatorId) {
      console.log('staking with', validatorId)
      state.status = true
      state.validatorId = validatorId
    },
    unstake (state) {
      console.log('unstaking')
      state.status = false
      state.validatorId = ''
    }
  }

  return { state, mutations }
}
