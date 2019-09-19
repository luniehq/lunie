const emptyState = {
  name: ``,
  seed: ``,
  password: ``,
  passwordConfirm: ``,
  warning: false
}

export default () => {
  return {
    state: {
      ...emptyState
    },
    mutations: {
      updateField(state, payload) {
        state[payload.field] = payload.value
      },
      recoverReset(state) {
        state = emptyState
      }
    }
  }
}
