export default ({ commit }) => {
  const state = {
    active: true,
    state: 0
  }
  const mutations = {
    loadOnboarding(state) {
      state.active = localStorage.getItem("appOnboardingActive")
      state.state = localStorage.getItem("appOnboardingState")
    },
    setOnboardingState(state, value) {
      state.state = value
      localStorage.setItem("appOnboardingState", value)
    },
    setOnboardingActive(state, value) {
      state.active = value
      localStorage.setItem("appOnboardingActive", value)
    }
  }
  return {
    state,
    mutations
  }
}
