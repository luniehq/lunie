import { startApp, main, routeGuard } from "scripts/boot"

jest.mock("scripts/vuetify.js", () => ({}))

async function start(urlParams, environment) {
  const node = {
    rpcConnect: jest.fn(),
    lcdConnected: jest.fn()
  }
  const Node = jest.fn(() => node)
  const store = {
    state: {},
    commit: jest.fn(),
    dispatch: jest.fn(() => Promise.resolve())
  }
  const Store = () => store
  const $mount = jest.fn()
  class Vue {
    constructor() {
      this.$mount = $mount
    }
  }
  Vue.config = {}
  Vue.use = jest.fn()
  Vue.directive = jest.fn()
  const Sentry = {
    init: jest.fn()
  }
  const enableGoogleAnalytics = jest.fn()
  const setGoogleAnalyticsPage = jest.fn()

  await startApp(
    urlParams || {},
    {
      stargate: `http://localhost:12344`,
      google_analytics_uid: `GUID`
    },
    Node,
    Store,
    environment || {
      NODE_ENV: `production`
    },
    Sentry,
    Vue,
    enableGoogleAnalytics,
    setGoogleAnalyticsPage
  )

  return {
    store,
    Vue,
    enableGoogleAnalytics,
    setGoogleAnalyticsPage,
    Sentry,
    Node
  }
}

describe(`App Start`, () => {
  // popper.js is used by tooltips and causes some errors if
  // not mocked because it requires a real DOM
  jest.mock(`popper.js`, () => () => {})
  jest.mock("@lunie/cosmos-keys", () => ({}))

  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`
    jest.resetModules()
  })

  it(`waits for the node have connected to init subscription`, async () => {
    const { store } = await start()

    expect(store.dispatch).toHaveBeenCalledWith(`connect`)
  })

  it(`checks for persisted sessions`, async () => {
    const { store } = await start()

    expect(store.dispatch).toHaveBeenCalledWith(`checkForPersistedSession`)
  })

  it(`gathers url parameters to overwrite the app config before starting the app`, () => {
    const getURLParams = jest.fn(() => ({
      x: 1
    }))
    const startApp = jest.fn()
    main(getURLParams, startApp, {
      config: `value`
    })
    expect(getURLParams).toHaveBeenCalled()
    expect(startApp).toHaveBeenCalledWith(
      {
        x: 1
      },
      {
        config: `value`
      }
    )
  })

  it(`Check the calls on VUE`, async () => {
    const { Vue } = await start()

    expect(Vue.directive).toHaveBeenCalledTimes(2)
    expect(Vue.use).toHaveBeenCalledTimes(4)
  })

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
        fullPath: `/staking/validators`,
        path: `/staking/validators`,
        name: `Validators`
      }
      const next = jest.fn()
      const guard = routeGuard(store)
      // from.fullPath !== to.fullPath && !store.getters.user.pauseHistory
      guard(to, { fullPath: `/` }, next)
      expect(next).toHaveBeenCalledWith(`/staking/my-delegations`)
    })
  })

  it(`activates analytics`, async () => {
    const { enableGoogleAnalytics, Sentry } = await start()

    expect(enableGoogleAnalytics).toHaveBeenCalledWith(`GUID`)

    // does init in a way that user errors are not tracked by default
    expect(Sentry.init).toHaveBeenCalledWith({})
  })

  it(`should set the current page in google analytics`, async () => {
    const { setGoogleAnalyticsPage } = await start()

    expect(setGoogleAnalyticsPage).toHaveBeenCalledWith(`/`)
  })

  describe(`url parameters`, () => {
    it(`should set development mode`, async () => {
      const { store } = await start({
        experimental: true
      })

      expect(store.commit).toHaveBeenCalledWith(`setExperimentalMode`)
    })

    it(`should set rpc url`, async () => {
      const { store } = await start({
        rpc: `http://rpcurl.com`
      })

      expect(store.commit).toHaveBeenCalledWith(
        `setRpcUrl`,
        `http://rpcurl.com`
      )
    })

    it(`should set stargate url`, async () => {
      const { Node } = await start({
        stargate: `http://stargateurl.com`
      })

      expect(Node).toHaveBeenCalledWith(`http://stargateurl.com`)
    })
  })
})
