import setup from "../../helpers/vuex-setup"

let instance = setup()

describe("Module: Delegates", () => {
  let store, node

  beforeEach(() => {
    let test = instance.shallow()
    store = test.store
    node = test.node
  })

  it("adds delegate to state", () => {
    store.commit("addDelegate", { pub_key: { data: "foo" } })
    expect(store.state.delegates.delegates[0]).toEqual({
      id: "foo",
      pub_key: { data: "foo" }
    })
    expect(store.state.delegates.delegates.length).toBe(1)
  })

  it("replaces existing delegate with same id", () => {
    store.commit("addDelegate", {
      pub_key: { data: "foo" },
      updated: true
    })
    expect(store.state.delegates.delegates[0]).toEqual({
      id: "foo",
      pub_key: { data: "foo" },
      updated: true
    })
    expect(store.state.delegates.delegates.length).toBe(1)
  })

  it("fetches a candidate", async () => {
    node.candidate = jest.fn().mockReturnValueOnce(
      Promise.resolve({
        data: {
          pub_key: { data: "foo" },
          test: 123
        }
      })
    )
    await store.dispatch("getDelegate", { data: "foo" })
    expect(store.state.delegates.delegates[0].test).toBe(123)
  })

  it("fetches all candidates", async () => {
    node.candidate = jest
      .fn()
      .mockReturnValueOnce(
        Promise.resolve({
          data: {
            pub_key: { data: "foo" },
            test: 123
          }
        })
      )
      .mockReturnValueOnce(
        Promise.resolve({
          data: {
            pub_key: { data: "bar" },
            test: 456
          }
        })
      )

    node.candidates = jest.fn().mockReturnValueOnce({
      data: [{ data: "foo" }, { data: "bar" }]
    })

    await store.dispatch("getDelegates")
    expect(store.state.delegates.delegates[0].test).toBe(123)
    expect(store.state.delegates.delegates[1].test).toBe(456)
  })

  it("updates existing candidates", async () => {
    store.commit("addDelegate", {
      pub_key: { data: "foo" },
      description: { country: "USA" }
    })
    store.commit("addDelegate", {
      pub_key: { data: "foo" },
      description: { country: "DE" }
    })
    expect(store.state.delegates.delegates[0].country).toBe("DE")
  })

  it("should query for delegates on reconnection", () => {
    jest.resetModules()
    let axios = require("axios")
    store.state.node.stopConnecting = true
    store.state.delegates.loading = true
    jest.spyOn(axios, "get")
    store.dispatch("reconnected")
    expect(axios.get.mock.calls).toMatchSnapshot()
  })

  it("should not query for delegates on reconnection if not stuck in loading", () => {
    jest.resetModules()
    let axios = require("axios")
    store.state.node.stopConnecting = true
    store.state.delegates.loading = false
    jest.spyOn(axios, "get")
    store.dispatch("reconnected")
    expect(axios.get.mock.calls.length).toBe(0)
  })
})
