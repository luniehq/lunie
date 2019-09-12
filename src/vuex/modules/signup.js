export default () => {
  const emptyState = {
    signUpName: ``,
    signUpSeed: `Creating seed...`,
    signUpPassword: ``,
    signUpPasswordConfirm: ``,
    signUpWarning: false
  }
  const state = {
    ...emptyState
  }
  const mutations = {
    updateField(state, payload) {
      state[payload.field] = payload.value
    }
  }

  const actions = {}
  return {
    state,
    mutations,
    actions
  }
}
