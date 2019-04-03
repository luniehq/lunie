"use strict"

// this mocks the IPC layer and isolates the mainthread from the renderer thread in tests
jest.mock(`electron`, () => ({
  clipboard: { writeText: jest.fn() },
  ipcRenderer: {
    send: jest.fn(),
    once: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn()
  },
  ipcMain: { on: jest.fn() },
  remote: {
    getGlobal(name) {
      if (name === `config`)
        return {
          default_network: `mock-net`,
          google_analytics_uid: `UA-TEST`,
          sentry_dsn: `https://xx:xx@sentry.io/xx`,
          version: `0.0.1`
        }
      if (name === `root`) return `./test/unit/tmp/test_root/`
    },
    app: {
      getVersion: jest.fn(() => `0.5.5`)
    }
  },
  shell: {
    openItem: jest.fn()
  }
}))
