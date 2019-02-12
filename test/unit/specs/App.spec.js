import { startApp, main, routeGuard } from "renderer/scripts/boot"
import App from "renderer/App"

describe(`App vue`, () => {
  it(`mount and call the store`, () => {
    const $store = { commit: jest.fn() }
    App.mounted.call({ $store })
    expect($store.commit).toHaveBeenCalledWith(`loadOnboarding`)
  })
})

describe(`App Start`, () => {
  // popper.js is used by tooltips and causes some errors if
  // not mocked because it requires a real DOM
  jest.mock(`popper.js`, () => () => {})

  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`
    jest.resetModules()
  })

  it(`waits for the node have connected to init subscription`, async () => {
    const node = {
      rpcConnect: jest.fn(),
      lcdConnected: jest.fn()
    }
    const Node = () => node
    const store = {
      state: {
        devMode: true
      },
      commit: jest.fn(),
      dispatch: jest.fn()
    }
    const Store = () => store
    const Vue = class {
      constructor() {
        this.$mount = jest.fn()
      }
      static config = {}
      static use = () => {}
      static directive = () => {}
    }
    const Sentry = {
      init: jest.fn()
    }

    await startApp(
      {
        stargate: `http://localhost:12344`
      },
      Node,
      Store,
      {
        NODE_ENV: `production`
      },
      Sentry,
      Vue
    )

    expect(store.dispatch).toHaveBeenCalledWith(`connect`)
  })

  it(`gathers url parameters to overwrite the app config before starting the app`, () => {
    const getURLParams = jest.fn(() => ({
      x: 1
    }))
    const startApp = jest.fn()
    main(getURLParams, startApp)
    expect(getURLParams).toHaveBeenCalled()
    expect(startApp).toHaveBeenCalled()
    expect(startApp.mock.calls[0][0]).toHaveProperty(`x`, 1)
  })

  it(`Check the calls on VUE`, async () => {
    // const mockVue = jest.mock(`Vue`)
    jest.mock(`vue-router`)
    jest.mock(`vue-directive-tooltip`)
    jest.mock(`vuelidate`)
    const $mount = jest.fn()
    class mockVue {
      constructor() {
        this.$mount = $mount
      }
    }
    mockVue.config = {}
    mockVue.use = jest.fn()
    mockVue.directive = jest.fn()

    const node = {
      rpcConnect: jest.fn(),
      lcdConnected: jest.fn()
    }
    const Node = () => node

    const store = {
      state: {
        devMode: true
      },
      commit: jest.fn(),
      dispatch: jest.fn()
    }
    const Store = () => store

    const Sentry = {
      init: jest.fn()
    }
    await startApp(
      {
        stargate: `http://localhost:12344`
      },
      Node,
      Store,
      {
        NODE_ENV: `production`
      },
      Sentry,
      mockVue
    )
    expect(mockVue.directive).toHaveBeenCalledTimes(1)
    expect(mockVue.use).toHaveBeenCalledTimes(3)
  })

  it(`Check the route guard`, async () => {
    const commit = jest.fn()
    const store = {
      commit,
      getters: { user: { pauseHistory: true } }
    }
    const next = jest.fn()
    const guard = routeGuard(store)
    // from.fullPath !== to.fullPath && !store.getters.user.pauseHistory
    guard({ fullPath: `a` }, { fullPath: `b` }, next)
    expect(commit).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it(`Check the route guard with no pause in history`, async () => {
    const commit = jest.fn()
    const store = {
      commit,
      getters: { user: { pauseHistory: false } }
    }
    const next = jest.fn()
    const guard = routeGuard(store)
    // from.fullPath !== to.fullPath && !store.getters.user.pauseHistory
    guard({ fullPath: `a` }, { fullPath: `b` }, next)
    expect(commit).toHaveBeenCalledWith(`addHistory`, `b`)
    expect(next).toHaveBeenCalled()
  })

  it(`Check the route guard when routes does not change`, async () => {
    const commit = jest.fn()
    const store = {
      commit,
      getters: { user: { pauseHistory: false } }
    }
    const next = jest.fn()
    const guard = routeGuard(store)
    // from.fullPath !== to.fullPath && !store.getters.user.pauseHistory
    guard({ fullPath: `a` }, { fullPath: `a` }, next)
    expect(commit).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
