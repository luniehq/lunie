/* mocking electron differently in one file apparently didn't work so I had to split the App tests in 2 files */

jest.mock('renderer/connectors/node.js', () => () => require('../helpers/node_mock'))

describe('App without analytics', () => {
  jest.mock('../../../config', () => ({
    google_analytics_uid: '123',
    sentry_dsn_public: '456'
  }))
  jest.mock('raven-js', () => ({
    config: (dsn) => {
      return ({ install: () => { } })
    },
    captureException: err => console.error(err)
  }))
  jest.mock('renderer/google-analytics.js', () => (uid) => { })
  jest.mock('electron', () => ({
    remote: {
      getGlobal: () => ({
        env: {
          NODE_ENV: 'test',
          COSMOS_ANALYTICS: 'false'
        }
      }),
      app: { getPath: () => { return '$HOME' } }
    },
    ipcRenderer: {
      on: (type, cb) => { },
      send: () => { }
    }
  }))

  beforeEach(() => {
    Object.defineProperty(window.location, 'search', {
      writable: true,
      value: '?node=localhost&relay_port=8080'
    })
    document.body.innerHTML = '<div id="app"></div>'
    jest.resetModules()
  })

  it('has all dependencies', async () => {
    await require('renderer/main.js')
  })

  it('does not activate google analytics if analytics is disabled', async mockDone => {
    jest.mock('renderer/google-analytics.js', () => (uid) => {
      mockDone.fail()
    })
    await require('renderer/main.js')
    mockDone()
  })

  it('does not set Raven dsn if analytics is disabled', mockDone => {
    jest.mock('raven-js', () => ({
      config: (dsn) => {
        expect(dsn).toBe('')
        return ({
          install: () => {
            mockDone()
          }
        })
      },
      captureException: err => console.error(err)
    }))
    require('renderer/main.js')
  })

  it('opens error modal', async () => {
    jest.resetModules()
    const { ipcRenderer } = require('electron')
    ipcRenderer.on = (type, cb) => {
      if (type === 'error') {
        cb(null, new Error('Expected'))
      }
    }

    const { store } = require('renderer/main.js')
    expect(store.state.config.modals.error.active).toBe(true)
    expect(store.state.config.modals.error.message).toBe('Expected')
  })

  it('sends a message to the main thread, that the app has loaded', () => {
    const { ipcRenderer } = require('electron')
    ipcRenderer.send = jest.fn()

    require('renderer/main.js')

    expect(ipcRenderer.send).toHaveBeenCalledWith('booted')
  })

  it('sends a message to the main thread, that the app sucessfully connected to a node and is usable', async () => {
    jest.resetModules()
    const { ipcRenderer } = require('electron')
    ipcRenderer.send = jest.fn()
    let connectedCB
    ipcRenderer.on = (type, cb) => {
      if (type === 'connected') {
        connectedCB = cb
      }
    }

    require('renderer/main.js')
    await connectedCB(null, 'localhost')

    expect(ipcRenderer.send.mock.calls).toEqual([['booted'], ['successful-launch']])
  })

  it('sends a successful-launch only on first start', async () => {
    jest.resetModules()
    const { ipcRenderer } = require('electron')
    ipcRenderer.send = jest.fn()
    let connectedCB
    ipcRenderer.on = (type, cb) => {
      if (type === 'connected') {
        connectedCB = cb
      }
    }

    require('renderer/main.js')
    connectedCB(null, 'localhost')
    await connectedCB(null, 'localhost')

    expect(ipcRenderer.send.mock.calls).toEqual([['booted'], ['successful-launch']])
  })

  it('does not send a successful-launch if can not connect to node', async () => {
    jest.resetModules()
    const { ipcRenderer } = require('electron')
    jest.doMock('renderer/connectors/node', () => () => ({
      rpcInfo: { connected: true },
      rpc: {
        subscribe: () => { }, on: () => { }, status: () => { }
      },
      rpcConnect: () => { },
      rpcReconnect: () => { },
      lcdConnected: () => Promise.resolve(false)
    }))

    ipcRenderer.send = jest.fn()
    let connectedCB
    ipcRenderer.on = (type, cb) => {
      if (type === 'connected') {
        connectedCB = cb
      }
    }

    await require('renderer/main.js')
    await connectedCB(null, 'localhost')

    expect(ipcRenderer.send.mock.calls).toEqual([['booted']])
  })
})
