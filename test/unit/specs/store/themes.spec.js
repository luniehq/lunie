import setup from "../../helpers/vuex-setup"

let instance = setup()

describe("Module: Themes", () => {
  let store, state

  beforeEach(() => {
    store = instance.shallow().store
    state = store.state.themes
  })

  it("loads themes", () => {
    expect(state.active).toBe("dark")
    localStorage.setItem("appTheme", "light")
    store.commit("loadTheme")
    expect(state.active).toBe("light")
  })

  it("sets themes", () => {
    expect(state.active).toBe("dark")
    store.commit("setTheme", "light")
    expect(state.active).toBe("light")
  })

  it("updates themes", () => {
    store.commit("updateTheme", "light")
  })
})
