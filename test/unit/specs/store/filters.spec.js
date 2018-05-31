import setup from "../../helpers/vuex-setup"

let instance = setup()

describe("Module: Filters", () => {
  let store, state

  beforeEach(() => {
    store = instance.shallow().store
    state = store.state.filters
  })

  it("can set a search type's visiblility", () => {
    expect(state.balances.search.visible).toBe(false)

    store.commit("setSearchVisible", ["balances", true])
    expect(state.balances.search.visible).toBe(true)

    store.commit("setSearchVisible", ["balances", false])
    expect(state.balances.search.visible).toBe(false)

    store.commit("setSearchVisible", ["balances", true])
    expect(state.balances.search.visible).toBe(true)

    store.commit("resetSearch", "balances")
    expect(state.balances.search.visible).toBe(false)
  })

  it("can set a search type's query", () => {
    expect(state.delegates.search.query).toBe("")

    store.commit("setSearchQuery", ["delegates", "validator1"])
    expect(state.delegates.search.query).toBe("validator1")
    expect(state.proposals.search.query).toBe("")
  })
})
