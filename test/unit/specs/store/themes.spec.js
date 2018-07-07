import setup from "../../helpers/vuex-setup"

let instance = setup()

describe("Module: Themes", () => {
  let store, state

  beforeEach(() => {
    store = instance.shallow().store
    state = store.state.themes
  })

  it("has a dark theme", () => {
    expect(state.options.dark).toMatchSnapshot()
  })

  it("has a light theme", () => {
    expect(state.options.light).toMatchSnapshot()
  })

  it("loads themes", () => {
    expect(state.active).toBe("dark")
    localStorage.setItem("appTheme", "light")
    store.dispatch("loadTheme")
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
