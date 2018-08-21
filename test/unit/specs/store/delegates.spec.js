import setup from "../../helpers/vuex-setup"

let instance = setup()

describe("Module: Delegates", () => {
  let store

  beforeEach(() => {
    let test = instance.shallow()
    store = test.store
  })

  it("adds delegate to state", () => {
    store.commit("addDelegate", {
      owner: "foo",
      tokens: "10"
    })
    expect(store.state.delegates.delegates[0]).toEqual({
      id: "foo",
      owner: "foo",
      tokens: "10",
      voting_power: "10.00"
    })
    expect(store.state.delegates.delegates.length).toBe(1)
  })

  it("replaces existing delegate with same id", () => {
    store.commit("addDelegate", {
      owner: "foo",
      tokens: "12",
      updated: true
    })
    expect(store.state.delegates.delegates[0]).toEqual({
      id: "foo",
      owner: "foo",
      tokens: "12",
      updated: true,
      voting_power: "12.00"
    })
    expect(store.state.delegates.delegates.length).toBe(1)
  })

  it("parses delegate tokens with fraction value", () => {
    store.commit("addDelegate", {
      owner: "foo",
      tokens: "4000/40",
      updated: true
    })
    expect(store.state.delegates.delegates[0]).toEqual({
      id: "foo",
      owner: "foo",
      tokens: "4000/40",
      updated: true,
      voting_power: "100.00"
    })
    expect(store.state.delegates.delegates.length).toBe(1)
  })

  it("fetches all candidates", async () => {
    await store.dispatch("getDelegates")
    let lcdClientMock = require("renderer/connectors/lcdClientMock.js")
    expect(store.state.delegates.delegates.map(x => x.owner)).toEqual(
      lcdClientMock.validators
    )
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

  function mockKeybaseLookup(axios) {
    axios.get = jest.fn(() =>
      Promise.resolve({
        data: {
          status: { name: "OK" },
          them: [
            {
              basics: {
                username: "keybaseUser"
              },
              pictures: {
                primary: {
                  url: "pictureUrl"
                }
              }
            }
          ]
        }
      })
    )
  }

  it("should query for the keybase identity", async () => {
    store.commit("addDelegate", {
      owner: "no-keybase",
      description: {
        identity: null
      }
    })
    store.commit("addDelegate", {
      owner: "keybase",
      description: {
        identity: "abcd"
      }
    })
    let axios = require("axios")
    mockKeybaseLookup(axios)
    await store.dispatch("updateValidatorAvatars")
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get.mock.calls).toMatchSnapshot()
  })

  it("should query only once for the keybase identity", async () => {
    store.commit("addDelegate", {
      owner: "no-keybase",
      description: {
        identity: null
      }
    })
    store.commit("addDelegate", {
      owner: "keybase",
      description: {
        identity: "abcd"
      }
    })
    let axios = require("axios")
    mockKeybaseLookup(axios)
    await store.dispatch("updateValidatorAvatars")
    await store.dispatch("updateValidatorAvatars")
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get.mock.calls).toMatchSnapshot()
  })
})
