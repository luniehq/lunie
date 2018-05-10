const { join } = require("path")
const mockFsExtra = require("../helpers/fs-mock").default

// prevents warnings from repeated event handling
process.setMaxListeners(1000)

// increase timeout since CI can be slow
// jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000

jest.mock("fs-extra", () => {
  let fs = require("fs")
  let mockFs = mockFsExtra()
  mockFs.writeFile(
    "./app/networks/basecoind-2/config.toml",
    fs.readFileSync("./app/networks/basecoind-2/config.toml", "utf8")
  )
  mockFs.writeFile(
    "./app/networks/basecoind-2/genesis.json",
    fs.readFileSync("./app/networks/basecoind-2/genesis.json", "utf8")
  )
  mockFs.writeFile(
    "./app/networks/basecoind-2/basecoindversion.txt",
    fs.readFileSync("./app/networks/basecoind-2/basecoindversion.txt", "utf8")
  )
  return mockFs
})
let fs = require("fs-extra")

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
  stderr: stderrMocks(path, args)
}))

let main
let root = "../../../"
let appRoot = root + "app/"
let testRoot = "./test/unit/tmp/test_root/"
let childProcess

describe("Startup Process", () => {
  Object.assign(process.env, {
    LOGGING: "false",
    COSMOS_NETWORK: "app/networks/basecoind-2",
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

    it("should init lcd server with correct testnet", async function() {
      expect(
        childProcess.spawn.mock.calls.find(
          ([path, args]) =>
            path.includes("gaiacli") &&
            args.includes("init") &&
            args.join("=").includes("--chain-id=basecoind-2")
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
            args.join("=").includes("--chain-id=basecoind-2")
        )
      ).toBeDefined()
    })

    it("should start lcd server", async function() {
      console.log(childProcess.spawn.mock.calls)
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

    it("should error on changed genesis.json", async function() {
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

      let { send } = require("electron")
      await require(appRoot + "src/main/index.js")

      expect(send.mock.calls[0][0]).toBe("error")
      expect(send.mock.calls[0][1].message).toContain("Genesis has changed")
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
      // axios is used to ping nodes for the reconnection intent
      let axios = require("axios")
      axios.get = () => Promise.resolve()

      main = await require(appRoot + "src/main/index.js")
    })

    afterEach(function() {
      main.shutdown()
      registeredIPCListeners = {}
    })

    it("should provide the connected node when the view has booted", async () => {
      expect(
        send.mock.calls.filter(([type, _]) => type === "connected").length
      ).toBe(1)
      expect(
        send.mock.calls.find(([type, _]) => type === "connected")[1]
      ).toBeTruthy() // TODO fix seeds so we can test nodeIP output
    })

    it("should reconnect on IPC call", async () => {
      await registeredIPCListeners["reconnect"]()

      expect(
        send.mock.calls.filter(([type, _]) => type === "connected").length
      ).toBe(2)
    })

    it("should not start reconnecting again if already trying to reconnect", async () => {
      let axios = require("axios")
      let spy = jest.spyOn(axios, "get")
      spy.mockImplementationOnce(async () => {
        await registeredIPCListeners["reconnect"]()
        return Promise.resolve()
      })

      await registeredIPCListeners["reconnect"]()
      expect(spy).toHaveBeenCalledTimes(1) // a node has only be pinged once
    })

    it("should search through nodes until it finds one", async () => {
      let axios = require("axios")
      axios.get = jest
        .fn()
        .mockReturnValueOnce(Promise.reject())
        .mockReturnValueOnce(Promise.resolve())

      await registeredIPCListeners["reconnect"]()

      expect(
        send.mock.calls.filter(([type, _]) => type === "connected").length
      ).toBe(2)
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
        send.mock.calls.filter(([type, _]) => type === "connected").length
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
      it("should survive the lcd folder being removed", async () => {
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
    testFailingChildProcess("gaiacli", "init")
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

    expect(send.mock.calls.find(([type, _]) => type === "error")).toBeTruthy()
    expect(
      send.mock.calls
        .find(([type, _]) => type === "error")[1]
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
          kill: () => {}
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
    stderr: stderrMocks(path, args)
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
