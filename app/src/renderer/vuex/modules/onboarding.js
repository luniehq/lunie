export default ({ commit }) => {
  const state = {
    active: true,
    state: 0
  }
  const mutations = {
    loadOnboarding(state) {
      // localstorage saves bools and ints as strings, so we have to convert
      state.active = JSON.parse(localStorage.getItem("appOnboardingActive"))
      state.state = parseInt(localStorage.getItem("appOnboardingState"))
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
