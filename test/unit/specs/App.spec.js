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
})
