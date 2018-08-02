const { join } = require("path")
const mockFsExtra = require("../helpers/fs-mock").default

// prevents warnings from repeated event handling
process.setMaxListeners(1000)

jest.mock("fs-extra", () => {
  let fs = require("fs")
  let mockFs = mockFsExtra()
  mockFs.writeFile(
    "./app/networks/gaia-6002/config.toml",
    fs.readFileSync("./test/unit/helpers/mockNetworkConfig/config.toml", "utf8")
  )
  mockFs.writeFile(
    "./app/networks/gaia-6002/genesis.json",
    fs.readFileSync(
      "./test/unit/helpers/mockNetworkConfig/genesis.json",
      "utf8"
    )
  )
  mockFs.writeFile(
    "./app/networks/gaia-6002/gaiaversion.txt",
    fs.readFileSync(
      "./test/unit/helpers/mockNetworkConfig/gaiaversion.txt",
      "utf8"
    )
  )
  return mockFs
})
let fs = require("fs-extra")

jest.mock("../../../app/src/renderer/connectors/lcdClient.js", () => {
  return () => ({
    listKeys: jest.fn().mockReturnValueOnce(Promise.reject())
  })
})

jest.mock("electron", () => {
  let electron = {
    app: {
      on: (event, cb) => {
        if (event === "ready") cb()
      }
    },
    send: jest.fn(), // NOT ELECTRON, used to test ipc calls to mainWindow.webContents.send
    BrowserWindow: class MockBrowserWindow {
      constructor() {
        this.webContents = {
          openDevTools: () => {},
          on: () => {},
          send: electron.send
        }
      }
      loadURL() {}
      on() {}
      once() {}
      maximize() {}
    },
    Menu: {
      buildFromTemplate() {},
      setApplicationMenu() {}
    },
    ipcMain: {
      on: (type, cb) => {
        if (type === "booted") {
          cb()
        }
        if (type === "hash-approved") {
          cb(null, "1234567890123456789012345678901234567890")
        }
      },
      removeAllListeners: () => {}
    }
  }
  return electron
})

let stdoutMocks = (path, args) => ({
  on: (type, cb) => {
    if (args[0] === "version" && type === "data") {
      cb({ toString: () => "0.13.0" })
    }
    // mock gaiacli init approval request
    if (
      type === "data" &&
      path.includes("gaiacli") &&
      args.includes("init") &&
      args.length > 4
    ) {
      cb("No hash yet")
      setImmediate(() => {
        cb("1234567890123456789012345678901234567890")
      })
    }
  }
})
let stderrMocks = (path, args) => ({
  on: (type, cb) => {
    // test for init of gaiacli
    if (type === "data" && args.includes("init") && args.length === 4) {
      cb({ toString: () => "already is initialized" })
    }
    if (
      path.includes("gaiacli") &&
      args.includes("rest-server") &&
      type === "data"
    ) {
      cb("Not yet serving the lcd")
      setImmediate(() => {
        cb("Serving on")
      })
    }
  }
})
childProcessMock((path, args) => ({
  on: (type, cb) => {
    // init processes always should return with 0
    if (type === "exit" && args.includes("init") && args.length > 4) {
      cb(0)
    }
  },
  stdin: { write: () => {} },
  stdout: stdoutMocks(path, args),
  stderr: stderrMocks(path, args),
  mocked: true
}))
mockConfig()

let main
let root = "../../../"
let appRoot = root + "app/"
let testRoot = "./test/unit/tmp/test_root/"
let childProcess

describe("Startup Process", () => {
  Object.assign(process.env, {
    LOGGING: "false",
    COSMOS_NETWORK: "app/networks/gaia-6002",
    COSMOS_HOME: testRoot,
    NODE_ENV: "testing"
  })
  delete process.env.BINARY_PATH

  jest.mock(appRoot + "src/root.js", () => "./test/unit/tmp/test_root")

  // uses package.json from voyager/ root.
  jest.mock(root + "package.json", () => ({ version: "0.1.0" }))

  // removed mocked genesis.json for these tests to check if starting up works
  beforeAll(() => {
    fs.removeSync(testRoot + "genesis.json")
  })

  describe("Initialization", function() {
    mainSetup()

    it("should create the config dir", async function() {
      expect(fs.existsSync(testRoot)).toBe(true)
    })

    xit("should init lcd server with correct testnet", async function() {
      expect(
        childProcess.spawn.mock.calls.find(
          ([path, args]) =>
            path.includes("gaiacli") &&
            args.includes("init") &&
            args.join("=").includes("--chain-id=gaia-6002")
        )
      ).toBeDefined()
    })

    it("should start lcd server", async function() {
      expect(
        childProcess.spawn.mock.calls.find(
          ([path, args]) =>
            path.includes("gaiacli") && args.includes("rest-server")
        )
      ).toBeDefined()
      expect(main.processes.lcdProcess).toBeDefined()
    })

    it("should persist the app_version", async function() {
      expect(fs.existsSync(testRoot + "app_version")).toBe(true)
      let appVersion = fs.readFileSync(testRoot + "app_version", "utf8")
      expect(appVersion).toBe("0.1.0")
    })
  })

  describe("Connection", function() {
    mainSetup()

    it("should error if it can't find a node to connect to", async () => {
      main.shutdown()
      prepareMain()
      let { send } = require("electron")
      send.mockClear()

      jest.doMock(
        "app/src/main/addressbook.js",
        () =>
          class MockAddressbook {
            async pickNode() {
              throw Error("no nodes")
            }
          }
      )

      // run main
      main = await require(appRoot + "src/main/index.js")

      expect(
        send.mock.calls.filter(([type]) => type === "connected").length
      ).toBe(0) // doesn't connect
      expect(send.mock.calls.filter(([type]) => type === "error").length).toBe(
        1
      )
      expect(
        send.mock.calls.filter(([type]) => type === "error")[0][1].code
      ).toBe("NO_NODES_AVAILABLE")
    })

    it("should look for a node with a compatible SDK version", async () => {
      main.shutdown()
      prepareMain()
      const mockAxiosGet = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve({ data: "0.1.0" })) // should fail as expected version is 0.13.0
        .mockReturnValueOnce(Promise.resolve({ data: "0.13.2" })) // should succeed as in semver range
      // mock the version check request
      jest.doMock("axios", () => ({
        get: mockAxiosGet
      }))
      let { send } = require("electron")
      send.mockClear()

      // run main
      main = await require(appRoot + "src/main/index.js")

      expect(mockAxiosGet).toHaveBeenCalledTimes(2)
      expect(send).toHaveBeenCalledWith("connected", "127.0.0.1:46657")
    })

    it("should mark a version incompatible if getting the SDK version fails", async () => {
      main.shutdown()
      prepareMain()

      // TODO replace with mockRejectOnce when updated jest
      let i = 0
      jest.doMock("axios", () => ({
        get: async () => {
          if (i++ === 0) {
            return Promise.reject("X")
          }
          return Promise.resolve({ data: "0.13.2" })
        }
      }))
      let nodeIncompatibleSpy = jest.fn()
      require("app/src/main/addressbook.js").prototype.flagNodeIncompatible = nodeIncompatibleSpy
      let { send } = require("electron")
      send.mockClear()

      // run main
      main = await require(appRoot + "src/main/index.js")

      expect(nodeIncompatibleSpy).toHaveBeenCalledWith("127.0.0.1:46657")
      expect(send).toHaveBeenCalledWith("connected", "127.0.0.1:46657") // check we still connect to a node. it shows the same node as pickNode always returns "127.0.0.1:46657" in tests
    })
  })

  describe("Initialization in dev mode", function() {
    beforeAll(async function() {
      jest.resetModules()

      Object.assign(process.env, {
        NODE_ENV: "development",
        LOGGING: "false"
      })
    })

    afterAll(() => {
      Object.assign(process.env, { NODE_ENV: null })
    })
    mainSetup()

    it("should create the config dir", async function() {
      expect(fs.existsSync(testRoot)).toBe(true)
    })

    xit("should init lcd server with correct testnet", async function() {
      expect(
        childProcess.spawn.mock.calls.find(
          ([path, args]) =>
            path.includes("gaiacli") &&
            args.includes("init") &&
            args.join("=").includes("--chain-id=gaia-6002")
        )
      ).toBeDefined()
    })

    it("should start lcd server", async function() {
      expect(
        childProcess.spawn.mock.calls.find(
          ([path, args]) =>
            path.includes("gaiacli") &&
            args.includes("rest-server") &&
            args.join("=").includes("--chain-id=gaia-6002")
        )
      ).toBeDefined()
      expect(main.processes.lcdProcess).toBeDefined()
    })

    it("should persist the app_version", async function() {
      expect(fs.existsSync(testRoot + "app_version")).toBe(true)
      let appVersion = fs.readFileSync(testRoot + "app_version", "utf8")
      expect(appVersion).toBe("0.1.0")
    })
  })

  describe("Start initialized", function() {
    mainSetup()

    xit("should not init lcd server again", async function() {
      expect(
        childProcess.spawn.mock.calls.find(
          ([path, args]) => path.includes("gaiacli") && args.includes("init")
        )
      ).toBeUndefined()
    })

    it("should start lcd server", async function() {
      expect(
        childProcess.spawn.mock.calls.find(
          ([path, args]) =>
            path.includes("gaiacli") && args.includes("rest-server")
        )
      ).toBeDefined()
      expect(main.processes.lcdProcess).toBeDefined()
    })
  })

  describe("Update app version", function() {
    mainSetup()

    it("should not replace the existing data", async function() {
      resetModulesKeepingFS()
      // alter the version so the main thread assumes an update
      jest.mock(root + "package.json", () => ({ version: "1.1.1" }))
      let { send } = require("electron")
      await require(appRoot + "src/main/index.js")

      expect(send.mock.calls[0][0]).toBe("error")
      expect(send.mock.calls[0][1].message).toContain(
        "incompatible app version"
      )

      let appVersion = fs.readFileSync(testRoot + "app_version", "utf8")
      expect(appVersion).toBe("0.1.0")
    })
  })

  describe("Update genesis.json", function() {
    mainSetup()

    it("should override the genesis.json file", async function() {
      resetModulesKeepingFS()

      // alter the genesis so the main thread assumes a change
      let existingGenesis = JSON.parse(
        fs.readFileSync(testRoot + "genesis.json", "utf8")
      )
      existingGenesis.genesis_time = new Date().toString()
      fs.writeFileSync(
        testRoot + "genesis.json",
        JSON.stringify(existingGenesis)
      )
      let specifiedGenesis = JSON.parse(
        fs.readFileSync(testRoot + "genesis.json", "utf8")
      )

      let { send } = require("electron")
      await require(appRoot + "src/main/index.js")

      expect(send.mock.calls[0][0]).toBe("connected")
      expect(existingGenesis).toEqual(specifiedGenesis)
    })
  })

  describe("IPC", () => {
    let registeredIPCListeners = {}
    let send

    function registerIPCListeners(registeredIPCListeners) {
      const { ipcMain } = require("electron")
      ipcMain.on = (type, cb) => {
        // the booted signal needs to be sent (from the view) for the main thread to signal events to the view
        if (type === "booted") {
          cb()
          return
        }
        if (type === "hash-approved") {
          cb(null, "1234567890123456789012345678901234567890")
          return
        }
        registeredIPCListeners[type] = cb
      }
    }

    beforeEach(async function() {
      prepareMain()
      send = require("electron").send

      registerIPCListeners(registeredIPCListeners)

      main = await require(appRoot + "src/main/index.js")
    })

    afterEach(function() {
      main.shutdown()
      registeredIPCListeners = {}
    })

    it("should provide the connected node when the view has booted", async () => {
      expect(
        send.mock.calls.filter(([type]) => type === "connected").length
      ).toBe(1)
      expect(
        send.mock.calls.find(([type]) => type === "connected")[1]
      ).toBeTruthy() // TODO fix seeds so we can test nodeIP output
    })

    it("should reconnect on IPC call", async () => {
      // the lcd process gets terminated and waits for the exit to continue so we need to trigger this event in our mocked process as well
      main.processes.lcdProcess.on = (type, cb) => {
        if (type === "exit") cb()
      }
      await registeredIPCListeners["reconnect"]()

      expect(
        send.mock.calls.filter(([type]) => type === "connected").length
      ).toBe(2)
    })

    it("should stop the LCD on IPC call", async () => {
      let killSpy = jest.spyOn(main.processes.lcdProcess, "kill")
      await registeredIPCListeners["stop-lcd"]()

      expect(killSpy).toHaveBeenCalled()
    })

    it("should report connection messages", async () => {
      prepareMain()

      jest.doMock(
        "app/src/main/addressbook.js",
        () =>
          class MockAddressbook {
            constructor(config, root, { onConnectionMessage }) {
              this.onConnectionMessage = onConnectionMessage
            }
            async pickNode() {
              this.onConnectionMessage("HALLO WORLD")
              return "127.0.0.1:46657"
            }
          }
      )
      let { send } = require("electron")
      send.mockClear()

      await require(appRoot + "src/main/index.js")
      expect(send).toHaveBeenCalledWith("connection-status", "HALLO WORLD")
    })

    it("should not start reconnecting again if already trying to reconnect", async done => {
      // the lcd process gets terminated and waits for the exit to continue so we need to trigger this event in our mocked process as well
      main.processes.lcdProcess.on = (type, cb) => {
        if (type === "exit") cb()
      }

      jest.doMock(
        "app/src/main/addressbook.js",
        () =>
          class MockAddressbook {
            constructor() {
              this.calls = 0
            }
            async pickNode() {
              try {
                expect(this.calls).toBe(0)
                this.calls++
                await registeredIPCListeners["reconnect"]()
                return "127.0.0.1:46657"
              } catch (err) {
                done.fail(err)
              }
            }
          }
      )

      await registeredIPCListeners["reconnect"]()
      done()
    })

    it("should print a success message if connected to node", async () => {
      let consoleSpy = jest.spyOn(console, "log")
      registeredIPCListeners["successful-launch"]()
      expect(consoleSpy.mock.calls[0][0]).toContain("[START SUCCESS]")

      consoleSpy.mockRestore()
    })

    it("should provide the error if the main process failed before the view has booted", async () => {
      main.shutdown()

      // simulate error by deleting a file
      resetModulesKeepingFS()
      fs.removeSync(join(testRoot, "genesis.json"))

      // register listeners again as we rest the modules
      registerIPCListeners(registeredIPCListeners)

      // run main
      main = await require(appRoot + "src/main/index.js")

      let { send } = require("electron")
      expect(send.mock.calls[0][0]).toEqual("error")
      expect(send.mock.calls[0][1]).toBeTruthy() // TODO fix seeds so we can test nodeIP output
    })

    it("should try another node if user disapproved the hash", async () => {
      main.shutdown()
      prepareMain()

      const { ipcMain } = require("electron")
      ipcMain.on = (type, cb) => {
        // the booted signal needs to be sent (from the view) for the main thread to signal events to the view
        if (type === "booted") {
          cb()
          return
        }
        // disapprove first hash
        if (type === "hash-disapproved") {
          cb(null, "1234567890123456789012345678901234567890")

          // approve second hash
          ipcMain.on = (type, cb) => {
            if (type === "hash-approved") {
              cb(null, "1234567890123456789012345678901234567890")
              return
            }
          }
        }
      }

      // run main
      main = await require(appRoot + "src/main/index.js")
      expect(
        send.mock.calls.filter(([type]) => type === "connected").length
      ).toBe(1)
    })
  })

  describe("Error handling", function() {
    afterEach(function() {
      main.shutdown()
    })

    it("should fail if config.toml has no seeds", async () => {
      main = await initMain()
      main.shutdown()
      let configText = fs.readFileSync(join(testRoot, "config.toml"), "utf8")
      configText = configText
        .split("\n")
        .map(line => {
          if (line.startsWith("seeds")) {
            return 'seeds = ""'
          } else if (line.startsWith("persistent_peers")) {
            return 'persistent_peers = ""'
          } else {
            return line
          }
        })
        .join("\n")
      fs.writeFileSync(join(testRoot, "config.toml"), configText, "utf8")

      resetModulesKeepingFS()
      let { send } = require("electron")
      main = await require(appRoot + "src/main/index.js")

      expect(send.mock.calls[0][0]).toBe("error")
      expect(send.mock.calls[0][1].message).toContain("seeds")
    })

    describe("missing files", () => {
      let send

      beforeEach(async () => {
        // make sure it is initialized
        jest.resetModules()
        main = await initMain()
        main.shutdown()

        resetModulesKeepingFS()
        let { send: _send } = require("electron")
        send = _send
      })
      afterEach(async () => {
        main.shutdown()
      })
      it("should error if the genesis.json being removed", async () => {
        fs.removeSync(join(testRoot, "genesis.json"))
        main = await require(appRoot + "src/main/index.js")

        expect(send.mock.calls[0][0]).toBe("error")
      })
      it("should error if the config.toml being removed", async () => {
        fs.removeSync(join(testRoot, "config.toml"))
        main = await require(appRoot + "src/main/index.js")

        expect(send.mock.calls[0][0]).toBe("error")
      })
      it("should error if the app_version being removed", async () => {
        fs.removeSync(join(testRoot, "app_version"))
        main = await require(appRoot + "src/main/index.js")

        expect(send.mock.calls[0][0]).toBe("error")
      })
      xit("should survive the lcd folder being removed", async () => {
        fs.removeSync(join(testRoot, "lcd"))
        resetModulesKeepingFS()
        let { send } = require("electron")
        main = await require(appRoot + "src/main/index.js")

        expect(
          childProcess.spawn.mock.calls.find(
            ([path, args]) => path.includes("gaiacli") && args.includes("init")
          ).length
        ).toBe(3) // one to check in first round, one to check + one to init in the second round

        expect(send.mock.calls[0][0]).toBe("connected")
      })
    })
  })

  describe("Error handling on init", () => {
    // testFailingChildProcess("gaiacli", "init")
    testFailingChildProcess("gaiacli", "rest-server")
  })
})

function mainSetup() {
  beforeAll(async function() {
    main = await initMain()
  })

  afterAll(function() {
    main.shutdown()
  })
}

// prepare mocks before we start the main process
function prepareMain() {
  // restart main with a now initialized state
  jest.resetModules()
  childProcess = require("child_process")
  // have the same mocked fs as main uses
  // this is reset with jest.resetModules
  fs = require("fs-extra")

  const Raven = require("raven")
  Raven.disableConsoleAlerts()

  jest.mock(
    "app/src/main/addressbook.js",
    () =>
      class MockAddressbook {
        async pickNode() {
          return "127.0.0.1:46657"
        }
        flagNodeIncompatible() {}
      }
  )

  // mock the version check request
  jest.mock("axios", () => ({
    get: async url => {
      if (url.indexOf("node_version") !== -1) {
        return { data: "0.13.0" }
      }
    }
  }))
}

async function initMain() {
  prepareMain()

  main = await require(appRoot + "src/main/index.js")
  expect(main).toBeDefined()
  return main
}

function testFailingChildProcess(name, cmd) {
  return it(`should fail if there is a not handled error in the ${name} ${cmd ||
    ""} process`, async function() {
    failingChildProcess(name, cmd)
    prepareMain()
    let { send } = require("electron")
    await require(appRoot + "src/main/index.js")

    expect(send.mock.calls.find(([type]) => type === "error")).toBeTruthy()
    expect(
      send.mock.calls
        .find(([type]) => type === "error")[1]
        .message.toLowerCase()
    ).toContain(name)
  })
}

function childProcessMock(mockExtend = () => ({})) {
  jest.doMock("child_process", () => ({
    spawn: jest.fn((path, args) =>
      Object.assign(
        {},
        {
          stdout: {
            on: () => {},
            pipe: () => {}
          },
          stderr: {
            on: () => {},
            pipe: () => {}
          },
          on: () => {},
          kill: () => {},
          removeAllListeners: () => {}
        },
        mockExtend(path, args)
      )
    )
  }))
}

function failingChildProcess(mockName, mockCmd) {
  childProcessMock((path, args) => ({
    on: (type, cb) => {
      if (type === "exit") {
        if (
          path.includes(mockName) &&
          (mockCmd === undefined || args.find(x => x === mockCmd))
        ) {
          cb(-1)
          // init processes always should return with 0
        } else if (args.find(x => x === "init")) {
          cb(0)
        }
      }
    },
    stdin: { write: () => {} },
    stdout: stdoutMocks(path, args),
    stderr: stderrMocks(path, args),
    mocked: true
  }))
}

// sometime we want to simulate a sequential run of the UI
// usualy we want to clean up all the modules after each run but in this case, we want to persist the mocked filesystem
function resetModulesKeepingFS() {
  let fileSystem = fs.fs
  jest.resetModules()
  fs = require("fs-extra")
  fs.fs = fileSystem

  // we want to keep Raven quiet
  const Raven = require("raven")
  Raven.disableConsoleAlerts()
}

function mockConfig() {
  jest.mock("app/src/config.js", () => ({
    name: "Cosmos Voyager",
    wds_port: 9080,
    lcd_port: 9070,
    lcd_port_prod: 9071,
    relay_port: 9060,
    relay_port_prod: 9061,

    default_network: "gaia-5001",
    mocked: false,

    google_analytics_uid: "UA-51029217-3",
    sentry_dsn: "https://abc:def@sentry.io/288169",
    sentry_dsn_public: "https://abc@sentry.io/288169"
  }))
}
