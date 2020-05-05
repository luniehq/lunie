const emptyState = {
  coinDenom: undefined
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
      resetMoonpayData(state) {
        Object.assign(state, emptyState)
      }
    },
    actions: {
      resetMoonpayData({ commit }) {
        commit(`resetMoonpayData`)
      }
    }
  }
}
