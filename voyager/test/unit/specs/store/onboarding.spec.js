import setup from "../../helpers/vuex-setup"

let instance = setup()

describe("Module: Onboarding", () => {
  let store, state

  beforeEach(() => {
    store = instance.shallow().store
    state = store.state.onboarding
  })

  it("toggles onboarding active state", () => {
    expect(state.active).toBe(true)
    store.commit("setOnboardingActive", false)
    expect(state.active).toBe(false)
    store.commit("setOnboardingActive", true)
    expect(state.active).toBe(true)
  })

  it("toggles onboarding state", () => {
    expect(state.state).toBe(0)
    store.commit("setOnboardingState", 3)
    expect(state.state).toBe(3)
    store.commit("setOnboardingState", 0)
    expect(state.state).toBe(0)
  })

  it("loads the onboarding active state from localStorage", () => {
    store.commit("setOnboardingActive", false)
    state.active = true
    store.commit("loadOnboarding")
    expect(state.active).toBe(false)
  })

  it("loads the onboarding state from localStorage", () => {
    store.commit("setOnboardingState", 3)
    state.state = 1
    store.commit("loadOnboarding")
    expect(state.state).toBe(3)
  })
})
