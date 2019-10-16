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
      // eslint-disable-next-line
      resetRecoverData(state) {
        // eslint-disable-next-line
        state = emptyState
      }
    },
    actions: {
      resetRecoverData({ commit }) {
        commit(`resetRecoverData`)
      }
    }
  }
}
