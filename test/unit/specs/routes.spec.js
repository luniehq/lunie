/* mocking electron differently in one file apparently didn't work so I had to split the App tests in 2 files */

jest.mock(
  "renderer/connectors/node.js",
  () => jest.fn(() => require("../helpers/node_mock")) // using jest.fn to be able to spy on the constructor call
)

describe("Routes", () => {
  jest.mock("../../../app/src/config", () => ({
    google_analytics_uid: "123",
    sentry_dsn_public: "456"
  }))
  jest.mock("raven-js", () => ({
    config: () => {
      return { install: () => {} }
    },
    captureException: err => console.error(err)
  }))
  jest.mock("renderer/google-analytics.js", () => () => {})
  jest.mock("electron", () => ({
    remote: {
      getGlobal: () => ({ mocked: false }),
      app: {
        getPath: () => {
          return "$HOME"
        }
      }
    },
    ipcRenderer: {
      on: () => {},
      send: () => {}
    }
  }))

  beforeEach(() => {
    Object.defineProperty(window.location, "search", {
      writable: true,
      value: "?node=localhost&lcd_port=8080"
    })
    document.body.innerHTML = '<div id="app"></div>'
    jest.resetModules()
  })

  it("activates the about window when navigating to /about", async done => {
    const { store, router } = require("renderer/main.js")

    router.push(
      "/about",
      () => {
        expect(store.state.config.showAbout).toBe(true)
        done()
      },
      err => {
        done.fail(err)
      }
    )
  })
})
