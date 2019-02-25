import poolModule from "renderer/vuex/modules/pool.js"

describe(`Module: Pool`, () => {
  let module, state, actions, mutations
  const pool = {
    loose_tokens: `100.0000000000`,
    bonded_tokens: `50.0000000000`
  }

  beforeEach(() => {
    module = poolModule({
      node: {
        getPool: jest.fn().mockResolvedValue(pool)
      }
    })
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  it(`should have correct defaults`, () => {
    expect(state.pool).toEqual({})
    expect(state.loading).toEqual(false)
    expect(state.loaded).toEqual(false)
    expect(state.error).toEqual(null)
  })

  it(`should set pool`, () => {
    mutations.setPool(state, pool)
    expect(state.pool).toBe(pool)
  })

  it(`should not query the pool if not connected`, async () => {
    const commit = jest.fn()
    const rootState = {
      connection: {
        connected: false
      }
    }

    await actions.getPool({ state, commit, rootState })
    expect(commit).not.toHaveBeenCalled()
  })

  it(`should query pool`, async () => {
    const commit = jest.fn()
    const rootState = {
      connection: {
        connected: true
      }
    }

    await actions.getPool({ state, commit, rootState })
    expect(commit).toHaveBeenCalledWith(`setPool`, pool)
    expect(state.error).toBe(null)
    expect(state.loading).toBe(false)
    expect(state.loaded).toBe(true)
  })

  it(`should store an error if failed to load pool information`, async () => {
    module = poolModule({
      node: {
        getPool: jest.fn().mockRejectedValue(`node.getPool failed`)
      }
    })
    state = module.state
    actions = module.actions
    mutations = module.mutations

    const commit = jest.fn()
    const rootState = {
      connection: {
        connected: true
      }
    }

    await actions.getPool({ state, commit, rootState })
    expect(commit).not.toHaveBeenCalled()
    expect(state.error).toBe(`node.getPool failed`)
    expect(state.loading).toBe(false)
    expect(state.loaded).toBe(false)
  })
})
