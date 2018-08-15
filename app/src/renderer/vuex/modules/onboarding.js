export default () => {
  const emptyState = {
    active: true,
    state: 0
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    loadOnboarding(state) {
      // localstorage saves bools and ints as strings, so we have to convert
      state.active = JSON.parse(
        localStorage.getItem("appOnboardingActive") || "true"
      )
      state.state = JSON.parse(
        localStorage.getItem("appOnboardingState") || "0"
      )
    },
    setOnboardingState(state, value) {
      state.state = value
      localStorage.setItem("appOnboardingState", JSON.stringify(value))
    },
    setOnboardingActive(state, value) {
      state.active = value
      localStorage.setItem("appOnboardingActive", JSON.stringify(value))
    }
  }

  const actions = {
    resetSessionData({ commit, rootState }) {
      rootState.onboarding = JSON.parse(JSON.stringify(emptyState))
      commit("loadOnboarding")
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
