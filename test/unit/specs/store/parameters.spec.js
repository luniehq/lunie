import setup from "../../helpers/vuex-setup"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import parametersModule from "renderer/vuex/modules/parameters.js"

let instance = setup()

const mockParameters = lcdClientMock.state.parameters

describe(`Module: Parameters`, () => {
  let store

  beforeEach(() => {
    let test = instance.shallow(null)
    store = test.store
  })

  it(`should have no parameters by default`, () => {
    expect(store.state.parameters.parameters).toEqual({})
  })

  it(`should query parameters`, async () => {
    await store.dispatch(`getStakingParameters`)
    expect(store.state.parameters.parameters).toEqual(mockParameters)
  })

  it(`should set parameters`, () => {
    store.commit(`setStakingParameters`, mockParameters)
    expect(store.state.parameters.parameters).toEqual(mockParameters)
  })

  it(`should store an error if failed to load parameters`, async () => {
    const node = lcdClientMock
    const { state, actions } = parametersModule({ node })
    jest
      .spyOn(node, `getStakingParameters`)
      .mockImplementationOnce(async () => Promise.reject(`Error`))
    await actions.getStakingParameters({
      state,
      commit: jest.fn()
    })
    expect(state.error).toBe(`Error`)
  })
})
