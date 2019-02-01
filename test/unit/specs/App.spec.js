import { startApp, main } from "renderer/scripts/boot"
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
    window.history.pushState(
      {},
      `Mock Voyager`,
      `/?node=localhost&lcd_port=8080`
    )
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
})
