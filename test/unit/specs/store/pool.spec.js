import setup from "../../helpers/vuex-setup"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import poolModule from "renderer/vuex/modules/pool.js"

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

  it(`should store an error if failed to load pool information`, async () => {
    const node = lcdClientMock
    const { state, actions } = poolModule({ node })
    jest
      .spyOn(node, `getPool`)
      .mockImplementationOnce(async () => Promise.reject(`Error`))
    await actions.getPool({
      state,
      commit: jest.fn()
    })
    expect(state.error).toBe(`Error`)
  })
})
