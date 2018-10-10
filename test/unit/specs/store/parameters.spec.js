import setup from "../../helpers/vuex-setup"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

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
    await store.dispatch(`getParameters`)
    expect(store.state.parameters.parameters).toEqual(mockParameters)
  })

  it(`should set parameters`, () => {
    store.commit(`setParameters`, mockParameters)
    expect(store.state.parameters.parameters).toEqual(mockParameters)
  })
})
