/* mocking electron differently in one file apparently didn't work so I had to split the App tests in 2 files */

jest.mock('renderer/node.js', () => () => require('../helpers/node_mock'))

describe('App with analytics', () => {
  jest.mock('../../../config', () => ({
    google_analytics_uid: '123',
    sentry_dsn_public: '456'
  }))
  jest.mock('raven-js', () => ({
    config: (dsn) => {
      return ({
        install: () => {
        }
      })
    }
  }))
  jest.mock('../../../app/src/renderer/google-analytics.js', () => (uid) => {
  })
  jest.mock('electron', () => ({
    remote: {
      getGlobal: () => ({
        env: {
          NODE_ENV: 'test',
          COSMOS_ANALYTICS: 'true'
        }
      })
    }
  }))

  beforeEach(() => {
    jest.resetModules()
  })

  it('activates google analytics if flag is enabled', async mock_done => {
    jest.mock('../../../app/src/renderer/google-analytics.js', () => (uid) => {
      expect(uid).toBe('123')
      mock_done()
    })
    require('renderer/main.js')
  })

  it('sets Raven dsn if analytics is enabled', mock_done => {
    jest.mock('raven-js', () => ({
      config: (dsn) => {
        expect(dsn).toBe('456')
        return ({
          install: () => {
            mock_done()
          }
        })
      }
    }))
    require('renderer/main.js')
  })
})

