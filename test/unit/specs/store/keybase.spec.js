import setup from "../../helpers/vuex-setup"

let instance = setup()

describe("Module: Keybase", () => {
  let store

  beforeEach(() => {
    let test = instance.shallow()
    store = test.store
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
    let axios = require("axios")
    mockKeybaseLookup(axios)

    await store.dispatch("getKeybaseIdentity", "abcdabcdabcdabcd")
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get.mock.calls).toMatchSnapshot()
  })

  it("should bulk update the validators", async () => {
    let axios = require("axios")
    mockKeybaseLookup(axios)

    let validators = [{ description: { identity: "abcdabcdabcdabcd" } }]

    await store.dispatch("getKeybaseIdentities", validators)
    expect(store.state.keybase.identities.abcdabcdabcdabcd).toBeTruthy()
  })

  it("should query only once for the keybase identity", async () => {
    let axios = require("axios")
    mockKeybaseLookup(axios)

    let validators = [{ description: { identity: "abcdabcdabcdabcd" } }]

    await store.dispatch("getKeybaseIdentities", validators)
    await store.dispatch("getKeybaseIdentities", validators)
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get.mock.calls).toMatchSnapshot()
  })
})
