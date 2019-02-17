import setup from "../../helpers/vuex-setup"
import keybaseModule from "renderer/vuex/modules/keybase.js"

const instance = setup()

describe(`Module: Keybase`, () => {
  let store, module

  beforeEach(() => {
    const test = instance.shallow()
    store = test.store
    module = keybaseModule({ node: test.node })
  })

  function mockKeybaseLookup(axios) {
    axios.get = jest.fn(() =>
      Promise.resolve({
        data: {
          status: { name: `OK` },
          them: [
            {
              basics: {
                username: `keybaseUser`
              },
              pictures: {
                primary: {
                  url: `pictureUrl`
                }
              }
            }
          ]
        }
      })
    )
  }

  it(`should query for the keybase identity`, async () => {
    const axios = require(`axios`)
    mockKeybaseLookup(axios)

    await store.dispatch(`getKeybaseIdentity`, `abcdabcdabcdabcd`)
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get.mock.calls).toMatchSnapshot()
  })

  it(`should bulk update the validators`, async () => {
    const axios = require(`axios`)
    mockKeybaseLookup(axios)

    const validators = [{ description: { identity: `abcdabcdabcdabcd` } }]

    await store.dispatch(`getKeybaseIdentities`, validators)
    expect(store.state.keybase.identities.abcdabcdabcdabcd).toBeTruthy()
  })

  it(`should query only once for the keybase identity`, async () => {
    const axios = require(`axios`)
    mockKeybaseLookup(axios)

    const validators = [{ description: { identity: `abcdabcdabcdabcd` } }]

    await store.dispatch(`getKeybaseIdentities`, validators)
    await store.dispatch(`getKeybaseIdentities`, validators)
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get.mock.calls).toMatchSnapshot()
  })

  it(`should store an error if failed to load keybase info`, async () => {
    const dispatch = async () => Promise.reject(`Error`)

    const { actions, state } = module
    const validators = [{ description: { identity: `abcdabcdabcdabcd` } }]
    await actions.getKeybaseIdentities(
      { commit: jest.fn(), dispatch, state },
      validators
    )
    expect(state.error).toBe(`Error`)
  })
})
