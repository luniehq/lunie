/* mocking electron differently in one file apparently didn't work so I had to split the App tests in 2 files */

jest.mock(
  `renderer/connectors/node.js`,
  () => jest.fn(() => require(`../helpers/node_mock`)) // using jest.fn to be able to spy on the constructor call
)

describe(`App Start`, () => {
  jest.mock(`../../../app/src/config`, () => ({
    google_analytics_uid: `123`
  }))
  jest.mock(`renderer/google-analytics.js`, () => () => {})
  // popper.js is used by tooltips and causes some errors if
  // not mocked because it requires a real DOM
  jest.mock(`popper.js`, () => () => {})
  jest.mock(`electron`, () => ({
    remote: {
      getGlobal: () => ({
        mocked: false,
        node_lcd: `https://awesomenode.de:12345`
      }),
      app: {
        getPath: () => {
          return `$HOME`
        }
      }
    },
    ipcRenderer: {
      on: () => {},
      send: () => {}
    }
  }))

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

  it(`uses a mocked connector implementation if set in config`, async () => {
    let electron = require(`electron`)
    electron.remote.getGlobal = () => ({
      env: { NODE_ENV: `test` },
      mocked: true,
      node_lcd: `https://awesomenode.de:12345`,
      development: false,
      lcd_port_prod: `8080`
    })
    let Node = require(`renderer/connectors/node.js`)
    require(`renderer/main.js`)
    expect(Node).toHaveBeenCalledWith(
      expect.any(Function),
      `https://localhost:8080`, // axios or axios proxy
      `https://awesomenode.de:12345`,
      true
    )
    jest.resetModules()
  })

  it(`does not activate google analytics if analytics is disabled`, async mockDone => {
    jest.mock(`renderer/google-analytics.js`, () => () => {
      mockDone.fail()
    })
    await require(`renderer/main.js`)
    mockDone()
  })

  it(`does not set Sentry dsn if analytics is disabled`, mockDone => {
    jest.mock(`@sentry/browser`, () => ({
      init: config => {
        expect(config).toEqual({})
        mockDone()
      },
      configureScope: () => {},
      captureException: () => {}
    }))
    require(`renderer/main.js`)
  })

  it(`opens error modal`, async () => {
    jest.resetModules()
    const { ipcRenderer } = require(`electron`)
    ipcRenderer.on = (type, cb) => {
      if (type === `error`) {
        cb(null, new Error(`Expected`))
      }
    }

    const { store } = require(`renderer/main.js`)
    expect(store.state.config.modals.error.active).toBe(true)
    expect(store.state.config.modals.error.message).toBe(`Expected`)
  })

  it(`triggers the approval flow on IPC message`, async () => {
    jest.resetModules()
    const { ipcRenderer } = require(`electron`)
    ipcRenderer.on = (type, cb) => {
      if (type === `approve-hash`) {
        cb(null, `THISISSOMEHASH`)
      }
    }

    const { store } = require(`renderer/main.js`)
    expect(store.state.connection.approvalRequired).toBe(`THISISSOMEHASH`)
  })

  it(`sends a message to the main thread, that the app has loaded`, () => {
    const { ipcRenderer } = require(`electron`)
    ipcRenderer.send = jest.fn()

    require(`renderer/main.js`)

    expect(ipcRenderer.send).toHaveBeenCalledWith(`booted`)
  })

  it(`sends a message to the main thread, that the app sucessfully connected to a node and is usable`, async () => {
    jest.resetModules()
    const { ipcRenderer } = require(`electron`)
    ipcRenderer.send = jest.fn()
    let connectedCB
    ipcRenderer.on = (type, cb) => {
      if (type === `connected`) {
        connectedCB = cb
      }
    }

    require(`renderer/main.js`)
    await connectedCB(null, `localhost`)

    expect(ipcRenderer.send.mock.calls).toEqual([
      [`booted`],
      [`successful-launch`]
    ])
  })

  it(`show that there are no nodes available to connect to`, async () => {
    jest.resetModules()
    const { ipcRenderer } = require(`electron`)
    ipcRenderer.send = jest.fn()
    let connectedCB
    ipcRenderer.on = (type, cb) => {
      if (type === `error`) {
        connectedCB = cb
      }
    }

    let { store } = require(`renderer/main.js`)
    await connectedCB(null, {
      code: `NO_NODES_AVAILABLE`,
      message: `message`
    })

    expect(store.state.config.modals.noNodes.active).toBe(true)
  })

  it(`sends a successful-launch only on first start`, async () => {
    jest.resetModules()
    const { ipcRenderer } = require(`electron`)
    ipcRenderer.send = jest.fn()
    let connectedCB
    ipcRenderer.on = (type, cb) => {
      if (type === `connected`) {
        connectedCB = cb
      }
    }

    require(`renderer/main.js`)
    connectedCB(null, `localhost`)
    await connectedCB(null, `localhost`)

    expect(ipcRenderer.send.mock.calls).toEqual([
      [`booted`],
      [`successful-launch`]
    ])
  })

  it(`does not send a successful-launch if can not connect to node`, async () => {
    jest.resetModules()
    const { ipcRenderer } = require(`electron`)
    jest.doMock(`renderer/connectors/node`, () => () => ({
      rpcInfo: { connected: true },
      rpc: {
        subscribe: () => {},
        on: () => {},
        status: () => {}
      },
      rpcConnect: () => {},
      rpcReconnect: () => {},
      lcdConnected: () => Promise.resolve(false),
      keys: {
        values: () => []
      }
    }))

    ipcRenderer.send = jest.fn()
    let connectedCB
    ipcRenderer.on = (type, cb) => {
      if (type === `connected`) {
        connectedCB = cb
      }
    }

    await require(`renderer/main.js`)
    await connectedCB(null, `localhost`)

    expect(ipcRenderer.send.mock.calls).toEqual([[`booted`]])
  })
})
