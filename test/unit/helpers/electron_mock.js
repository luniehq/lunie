// this mocks the IPC layer and isolates the mainthread from the renderer thread in tests 
jest.mock("electron", () => ({ 
  clipboard: { writeText: jest.fn() }, 
  ipcRenderer: { send: jest.fn() }, 
  ipcMain: { on: jest.fn() }, 
  remote: { 
    getGlobal(name) { 
      if (name === "config") 
        return { 
          default_network: "mock-net", 
          google_analytics_uid: "UA-TEST", 
          sentry_dsn: 
            "https://4dee9f70a7d94cc0959a265c45902d84:cbf160384aab4cdeafbe9a08dee3b961@sentry.io/288169", 
          sentry_dsn_public: 
            "https://4dee9f70a7d94cc0959a265c45902d84@sentry.io/288169" 
        } 
      if (name === "root") return "./test/unit/tmp/test_root/" 
    } 
  } 
})) 