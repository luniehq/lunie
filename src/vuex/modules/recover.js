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
        console.log(payload)
        state[payload.field] = payload.value
      },
      recoverReset(state) {
        state = emptyState
      },
      updateSeed(state, seed) {
        state.seed = seed
      }
    }
  }
}
