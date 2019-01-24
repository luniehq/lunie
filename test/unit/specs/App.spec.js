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

  it(`has all dependencies`, async () => {
    await require(`renderer/main.js`)
  })

  it(`waits for the node have connected to init subscription`, async () => {
    const { main } = await require(`renderer/main.js`)

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
    const Vue = () => ({ $mount: jest.fn() })
    const Sentry = {
      init: jest.fn()
    }

    await main(
      Node,
      Store,
      {
        NODE_ENV: `production`
      },
      Sentry,
      Vue,
      {
        node_lcd: `http://localhost:12344`
      }
    )

    expect(store.dispatch).toHaveBeenCalledWith(`connect`)
  })
})
