import setup from "../../helpers/vuex-setup"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

let instance = setup()

const mockPool = lcdClientMock.state.pool

describe(`Module: Pool`, () => {
  let store

  beforeEach(() => {
    let test = instance.shallow(null)
    store = test.store
  })

  it(`should have no pool by default`, () => {
    expect(store.state.pool.pool).toEqual({})
  })

  it(`should query pool`, async () => {
    await store.dispatch(`getPool`)
    expect(store.state.pool.pool).toEqual(mockPool)
  })

  it(`should set pool`, () => {
    store.commit(`setPool`, mockPool)
    expect(store.state.pool.pool).toEqual(mockPool)
  })
})
