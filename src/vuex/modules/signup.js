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
    },
    resetSignUpData(state) {
      Object.assign(state, emptyState)
    }
  }
  const actions = {
    resetSignUpData(commit) {
      commit(`resetSignUpData`)
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
