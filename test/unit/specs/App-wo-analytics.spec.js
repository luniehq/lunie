/* mocking electron differently in one file apparently didn't work so I had to split the App tests in 2 files */

jest.mock('renderer/connectors/node.js', () => () => require('../helpers/node_mock'))

describe('App without analytics', () => {
  jest.mock('../../../config', () => ({
    google_analytics_uid: '123',
    sentry_dsn_public: '456'
  }))
  jest.mock('raven-js', () => ({
    config: (dsn) => {
      return ({ install: () => {} })
    },
    captureException: err => console.error(err)
  }))
  jest.mock('axios', () => ({ get () {} }))
  jest.mock('../../../app/src/renderer/google-analytics.js', () => (uid) => {})
  jest.mock('electron', () => ({
    remote: {
      getGlobal: () => ({
        env: {
          NODE_ENV: 'test',
          COSMOS_ANALYTICS: 'false'
        }
      }),
      app: { getPath: () => { return '$HOME' } }
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
    jest.mock('../../../app/src/renderer/google-analytics.js', () => (uid) => {
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

  it('opens error modal', () => {
    jest.resetModules()
    Object.defineProperty(window.location, 'search', {
      writable: true,
      value: '?node=localhost&relay_port=8080&error=Expected'
    })
    let { store } = require('renderer/main.js')
    expect(store.state.config.modals.error.active).toBe(true)
    expect(store.state.config.modals.error.message).toBe('Expected')
  })
})
