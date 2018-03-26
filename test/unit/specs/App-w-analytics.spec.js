/* mocking electron differently in one file apparently didn't work so I had to split the App tests in 2 files */

jest.mock('renderer/node.js', () => () => require('../helpers/node_mock'))

describe('App with analytics', () => {
  jest.mock('../../../config', () => ({
    google_analytics_uid: '123',
    sentry_dsn_public: '456'
  }))
  jest.mock('raven-js', () => ({
    config: (dsn) => {
      return ({ install: () => { } })
    }
  }))
  jest.mock('axios', () => ({ get () { } }))
  jest.mock('../../../app/src/renderer/google-analytics.js', () => (uid) => { })
  jest.mock('electron', () => ({
    remote: {
      getGlobal: () => ({
        env: {
          NODE_ENV: 'test',
          COSMOS_ANALYTICS: 'true'
        }
      })
    },
    ipcRenderer: {
      on: (type, cb) => {
        if (type === 'connected') {
          cb(null, 'localhost')
        }
      },
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

  it('activates google analytics if flag is enabled', async mockDone => {
    jest.mock('../../../app/src/renderer/google-analytics.js', () => (uid) => {
      expect(uid).toBe('123')
      mockDone()
    })
    require('renderer/main.js')
  })

  it('sets Raven dsn if analytics is enabled', mockDone => {
    jest.mock('raven-js', () => ({
      config: (dsn) => {
        expect(dsn).toBe('456')
        return ({
          install: () => {
            mockDone()
          }
        })
      }
    }))
    require('renderer/main.js')
  })
})
