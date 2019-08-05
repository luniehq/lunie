import { routeGuard } from "src/router"

describe(`Route guard`, () => {
  it(`Check the route guard`, async () => {
    const commit = jest.fn()
    const store = {
      commit,
      state: { session: { pauseHistory: true, signedIn: false } },
      getters: { session: { pauseHistory: true, signedIn: false } }
    }
    const next = jest.fn()
    const guard = routeGuard(store)
    const to = {
      redirectedFrom: `/`,
      fullPath: `/`,
      path: `/`,
      matched: [{ meta: { requiresAuth: false } }]
    }
    // from.fullPath !== to.fullPath && !store.getters.user.pauseHistory
    guard(to, { fullPath: `b` }, next)
    expect(commit).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it(`Check the route guard with no pause in history`, async () => {
    const commit = jest.fn()
    const store = {
      commit,
      state: { session: { pauseHistory: false, signedIn: false } },
      getters: { session: { pauseHistory: false, signedIn: false } }
    }
    const next = jest.fn()
    const guard = routeGuard(store)
    const to = {
      redirectedFrom: `/`,
      fullPath: `/`,
      path: `/`,
      matched: [{ meta: { requiresAuth: false } }]
    }
    // from.fullPath !== to.fullPath && !store.getters.user.pauseHistory
    guard(to, { fullPath: `b` }, next)
    expect(commit).toHaveBeenCalledWith(`addHistory`, `b`)
    expect(next).toHaveBeenCalled()
  })

  it(`Check the route guard when routes does not change`, async () => {
    const commit = jest.fn()
    const store = {
      commit,
      state: { session: { pauseHistory: false, signedIn: true } },
      getters: { session: { pauseHistory: false, signedIn: true } }
    }
    const next = jest.fn()
    const guard = routeGuard(store)
    // from.fullPath !== to.fullPath && !store.getters.user.pauseHistory
    guard({ fullPath: `a` }, { fullPath: `a` }, next)
    expect(commit).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it(`redirects to my validators`, async () => {
    const commit = jest.fn()
    const store = {
      commit,
      state: { session: { pauseHistory: false, signedIn: true } },
      getters: { session: { pauseHistory: false, signedIn: true } }
    }
    const to = {
      redirectedFrom: `/staking`,
      fullPath: `/validators`,
      path: `/validators`,
      name: `Validators`
    }
    const next = jest.fn()
    const guard = routeGuard(store)
    // from.fullPath !== to.fullPath && !store.getters.user.pauseHistory
    guard(to, { fullPath: `/` }, next)
    expect(next).toHaveBeenCalledWith(`/staking/my-delegations`)
  })
})
