const { join } = require(`path`)
const mockFsExtra = require(`../helpers/fs-mock`).default
jest.mock(`readline`, () => ({
  createInterface: () => ({
    on: () => {}
  })
}))

jest.mock(`raven`, () => ({
  config: () => ({ install: () => {} }),
  uninstall: () => ({ config: () => ({ install: () => {} }) }),
  captureException: () => {}
}))

// prevents warnings from repeated event handling
process.setMaxListeners(1000)

jest.mock(`fs-extra`, () => {
  let fs = require(`fs`)
  let mockFs = mockFsExtra()
  mockFs.writeFile(
    `./app/networks/gaia-6002/config.toml`,
    fs.readFileSync(`./test/unit/helpers/mockNetworkConfig/config.toml`, `utf8`)
  )
  mockFs.writeFile(
    `./app/networks/gaia-6002/genesis.json`,
    fs.readFileSync(
      `./test/unit/helpers/mockNetworkConfig/genesis.json`,
      `utf8`
    )
  )
  mockFs.writeFile(
    `./app/networks/gaia-6002/gaiaversion.txt`,
    fs.readFileSync(
      `./test/unit/helpers/mockNetworkConfig/gaiaversion.txt`,
      `utf8`
    )
  )
  mockFs.writeFile(`./cert/cert.txt`, `super-cert`)
  return mockFs
})
let fs = require(`fs-extra`)

jest.mock(`electron`, () => {
  let electron = {
    app: {
      on: (event, cb) => {
        if (event === `ready`) cb()
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
        if (type === `booted`) {
          cb()
        }
        if (type === `hash-approved`) {
          cb(null, `1234567890123456789012345678901234567890`)
        }
      },
      removeAllListeners: () => {}
    }
  }
  return electron
})

const mockSpawnReturnValue = () => {
  return Object.assign(
    {},
    {
      on: () => {},
      kill: () => {},
      removeAllListeners: () => {},
      mocked: true,
      stdout: {
        on: () => {},
        once: () => {},
        pipe: () => {}
      },
      stderr: {
        on: () => {},
        once: () => {},
        pipe: () => {}
      }
    }
  )
}

let stdoutMocks = (path, args) => ({
  on: (type, cb) => {
    if (args[0] === `version` && type === `data`) {
      cb({ toString: () => `0.13.0` })
    }
  },
  once: (type, cb) => {
    if (type === `line`) {
      cb(`(cert: "cert/cert.txt"...`)
    }
  }
})
mockConfig()

let main
let root = `../../../`
let appRoot = root + `app/`
let testRoot = `./test/unit/tmp/test_root/`
let childProcess

describe(`Startup Process`, () => {
  Object.assign(process.env, {
    LOGGING: `false`,
    COSMOS_NETWORK: `app/networks/gaia-6002`,
    COSMOS_HOME: testRoot,
    NODE_ENV: `testing`
  })
  delete process.env.BINARY_PATH

  jest.mock(appRoot + `src/root.js`, () => `./test/unit/tmp/test_root`)

  // uses package.json from voyager/ root.
  jest.mock(root + `package.json`, () => ({ version: `0.1.0` }))

  // removed mocked genesis.json for these tests to check if starting up works
  beforeAll(() => {
    fs.removeSync(testRoot + `genesis.json`)
  })

  describe(`Initialization`, function() {
    mainSetup()

    it(`should create the config dir`, async function() {
      expect(fs.existsSync(testRoot)).toBe(true)
    })

    it(`should start lcd server`, async function() {
      expect(
        childProcess.spawn.mock.calls.find(
          ([path, args]) =>
            path.includes(`gaiacli`) && args.includes(`rest-server`)
        )
      ).toBeDefined()
      expect(main.processes.gaiaLiteProcess).toBeDefined()
    })

    it(`should persist the app_version`, async function() {
      expect(fs.existsSync(testRoot + `app_version`)).toBe(true)
      let appVersion = fs.readFileSync(testRoot + `app_version`, `utf8`)
      expect(appVersion).toBe(`0.1.0`)
    })
  })

  describe(`Connection`, function() {
    mainSetup()

    afterEach(() => {
      jest.useRealTimers()
    })

    xit(`should retry connecting if it can't connect to the node`, async () => {
      jest.useFakeTimers()
      await main.shutdown()
      prepareMain()
      let mockNodeVersionEndpoint = jest.fn(() => Promise.reject(`X`))
      jest.doMock(`renderer/connectors/lcdClient.js`, () => () => ({
        nodeVersion: mockNodeVersionEndpoint
      }))
      let { send } = require(`electron`)
      send.mockClear()

      // run main
      main = await require(appRoot + `src/main/index.js`)
      jest.runAllTimers()
      expect(mockNodeVersionEndpoint).toHaveBeenCalledTimes(2)
    })

    it(`should check if our node has a compatible SDK version`, async () => {
      await main.shutdown()
      prepareMain()
      const nodeVersionSpy = jest.fn(() => `0.1.0`)
      jest.doMock(`renderer/connectors/lcdClient.js`, () => () => ({
        nodeVersion: nodeVersionSpy
      }))
      let { send } = require(`electron`)
      send.mockClear()

      // run main
      main = await require(appRoot + `src/main/index.js`)

      expect(nodeVersionSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe(`Initialization in dev mode`, function() {
    beforeAll(async function() {
      jest.resetModules()

      Object.assign(process.env, {
        NODE_ENV: `development`,
        LOGGING: `false`
      })
    })

    afterAll(() => {
      Object.assign(process.env, { NODE_ENV: null })
    })
    mainSetup()

    it(`should create the config dir`, async function() {
      expect(fs.existsSync(testRoot)).toBe(true)
    })

    it(`should start lcd server`, async function() {
      expect(
        childProcess.spawn.mock.calls.find(
          ([path, args]) =>
            path.includes(`gaiacli`) &&
            args.includes(`rest-server`) &&
            args.join(`=`).includes(`--chain-id=gaia-6002`)
        )
      ).toBeDefined()
      expect(main.processes.gaiaLiteProcess).toBeDefined()
    })

    it(`should persist the app_version`, async function() {
      expect(fs.existsSync(testRoot + `app_version`)).toBe(true)
      let appVersion = fs.readFileSync(testRoot + `app_version`, `utf8`)
      expect(appVersion).toBe(`0.1.0`)
    })
  })

  describe(`Start initialized`, function() {
    mainSetup()

    xit(`should not init lcd server again`, async function() {
      expect(
        childProcess.spawn.mock.calls.find(
          ([path, args]) => path.includes(`gaiacli`) && args.includes(`init`)
        )
      ).toBeUndefined()
    })

    it(`should start lcd server`, async function() {
      expect(
        childProcess.spawn.mock.calls.find(
          ([path, args]) =>
            path.includes(`gaiacli`) && args.includes(`rest-server`)
        )
      ).toBeDefined()
      expect(main.processes.gaiaLiteProcess).toBeDefined()
    })
  })

  describe(`Update app version`, function() {
    mainSetup()

    it(`should not replace the existing data`, async function() {
      resetModulesKeepingFS()
      // alter the version so the main thread assumes an update
      jest.mock(root + `package.json`, () => ({ version: `1.1.1` }))
      let { send } = require(`electron`)
      await require(appRoot + `src/main/index.js`)

      expect(send.mock.calls[0][0]).toBe(`error`)
      expect(send.mock.calls[0][1].message).toContain(
        `incompatible app version`
      )

      let appVersion = fs.readFileSync(testRoot + `app_version`, `utf8`)
      expect(appVersion).toBe(`0.1.0`)
    })
  })

  describe(`Update genesis.json`, function() {
    mainSetup()

    it(`should override the genesis.json file`, async function() {
      resetModulesKeepingFS()

      // alter the genesis so the main thread assumes a change
      let existingGenesis = JSON.parse(
        fs.readFileSync(testRoot + `genesis.json`, `utf8`)
      )
      existingGenesis.genesis_time = new Date().toString()
      fs.writeFileSync(
        testRoot + `genesis.json`,
        JSON.stringify(existingGenesis)
      )
      let specifiedGenesis = JSON.parse(
        fs.readFileSync(testRoot + `genesis.json`, `utf8`)
      )

      let { send } = require(`electron`)
      await require(appRoot + `src/main/index.js`)

      expect(send.mock.calls[0][0]).toBe(`connected`)
      expect(existingGenesis).toEqual(specifiedGenesis)
    })
  })

  describe(`IPC`, () => {
    let registeredIPCListeners = {}
    let send

    function registerIPCListeners(registeredIPCListeners) {
      const { ipcMain } = require(`electron`)
      ipcMain.on = (type, cb) => {
        // the booted signal needs to be sent (from the view) for the main thread to signal events to the view
        if (type === `booted`) {
          cb()
          return
        }
        if (type === `hash-approved`) {
          cb(null, `1234567890123456789012345678901234567890`)
          return
        }
        registeredIPCListeners[type] = cb
      }
    }

    beforeEach(async function() {
      prepareMain()
      send = require(`electron`).send

      registerIPCListeners(registeredIPCListeners)

      main = await require(appRoot + `src/main/index.js`)
    })

    afterEach(async function() {
      await main.shutdown()
      registeredIPCListeners = {}
    })

    it(`should provide the connected node when the view has booted`, async () => {
      expect(
        send.mock.calls.filter(([type]) => type === `connected`).length
      ).toBe(1)
      expect(
        send.mock.calls.find(([type]) => type === `connected`)[1]
      ).toBeTruthy() // TODO fix seeds so we can test nodeIP output
    })

    it(`should reconnect on IPC call`, async () => {
      await registeredIPCListeners[`reconnect`]()

      expect(
        send.mock.calls.filter(([type]) => type === `connected`).length
      ).toBe(2)
    })

    it(`should stop the LCD on IPC call`, async () => {
      let process
      while (!process) {
        await new Promise(resolve => setTimeout(resolve, 100))
        process = main.getGaiaLiteProcess()
      }
      process.kill = jest.fn()
      await registeredIPCListeners[`stop-lcd`]()

      expect(process.kill).toHaveBeenCalled()
    })

    it(`should not start reconnecting again if already trying to reconnect`, async done => {
      jest.doMock(
        `app/src/main/addressbook.js`,
        () =>
          class MockAddressbook {
            constructor() {
              this.calls = 0
            }
            async pickNode() {
              try {
                expect(this.calls).toBe(0)
                this.calls++
                await registeredIPCListeners[`reconnect`]()
                return `127.0.0.1:46657`
              } catch (error) {
                done.fail(error)
              }
            }
          }
      )

      await registeredIPCListeners[`reconnect`]()
      done()
    })

    it(`should print a success message if connected to node`, async () => {
      let consoleSpy = jest.spyOn(console, `log`)
      registeredIPCListeners[`successful-launch`]()
      expect(consoleSpy.mock.calls[0][0]).toContain(`[START SUCCESS]`)

      consoleSpy.mockRestore()
    })

    it(`should provide the error if the main process failed before the view has booted`, async () => {
      await main.shutdown()

      // simulate error by deleting a file
      resetModulesKeepingFS()
      fs.removeSync(join(testRoot, `genesis.json`))

      // register listeners again as we rest the modules
      registerIPCListeners(registeredIPCListeners)

      // run main
      main = await require(appRoot + `src/main/index.js`)

      let { send } = require(`electron`)
      expect(send.mock.calls[0][0]).toEqual(`error`)
      expect(send.mock.calls[0][1]).toBeTruthy() // TODO fix seeds so we can test nodeIP output
    })
  })

  describe(`Error handling`, function() {
    afterEach(async function() {
      await main.shutdown()
    })

    it(`should error on gaiacli crashing on reconnect instead of breaking`, async () => {
      await initMain()
      let { send } = require(`electron`)

      childProcess.spawn = () =>
        Object.assign(mockSpawnReturnValue(), {
          on: (type, cb) => {
            if (type === `exit`) {
              cb(0)
            }
          },
          stderr: {
            on: (type, cb) => {
              if (type === `line`) {
                cb(Buffer.from(`Some error`))
              }
            },
            once: () => {},
            pipe: () => {}
          }
        })

      await main.eventHandlers.reconnect()
      expect(
        send.mock.calls.find(([type]) => type === `error`)
      ).toMatchSnapshot()
    })

    it(`should error on gaiacli crashing async instead of breaking`, async () => {
      let errorCB

      jest.resetModules()
      childProcessMock((path, args) => ({
        stdin: { write: () => {} },
        stdout: stdoutMocks(path, args),
        stderr: {
          on: (type, cb) => {
            if (args[0] === `rest-server` && type === `line`) {
              errorCB = cb
            }
          },
          once: () => {}
        },
        on: (type, cb) => {
          if (args[0] === `init` && type === `exit`) {
            cb(0)
          }
          if (args[0] === `rest-server` && type === `exit`) {
            setImmediate(() => {
              cb(0)
            })
          }
          if (args[0] === `keys` && args[1] === `delete` && type === `exit`) {
            cb(0)
          }
        }
      }))

      main = await require(appRoot + `src/main/index.js`)
      let { send } = require(`electron`)

      expect(send.mock.calls.find(([type]) => type === `error`)).toBeUndefined()

      while (!errorCB) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      errorCB(Buffer.from(`Gaiacli errord asynchronous`))

      expect(
        send.mock.calls.find(([type]) => type === `error`)
      ).not.toBeUndefined()
      expect(
        send.mock.calls.find(([type]) => type === `error`)
      ).toMatchSnapshot()
    })

    describe(`missing files`, () => {
      let send

      beforeEach(async () => {
        // make sure it is initialized
        jest.resetModules()
        main = await initMain()
        await main.shutdown()

        resetModulesKeepingFS()
        let { send: _send } = require(`electron`)
        send = _send
      })
      afterEach(async () => {
        await main.shutdown()
      })
      it(`should error if the genesis.json being removed`, async () => {
        fs.removeSync(join(testRoot, `genesis.json`))
        main = await require(appRoot + `src/main/index.js`)

        expect(send.mock.calls[0][0]).toBe(`error`)
      })
      it(`should error if the config.toml being removed`, async () => {
        fs.removeSync(join(testRoot, `config.toml`))
        main = await require(appRoot + `src/main/index.js`)

        expect(send.mock.calls[0][0]).toBe(`error`)
      })
      it(`should error if the app_version being removed`, async () => {
        fs.removeSync(join(testRoot, `app_version`))
        main = await require(appRoot + `src/main/index.js`)

        expect(send.mock.calls[0][0]).toBe(`error`)
      })
    })
  })

  describe(`Error handling on init`, () => {
    it(`should fail if there is a not handled error in the rest-server process`, async function() {
      // TODO refactor standout on responses
      jest.resetModules()
      childProcessMock((path, args) => ({
        stdin: { write: () => {} },
        stdout: Object.assign({}, stdoutMocks(path, args), { once: () => {} }),
        stderr: {
          on: (type, cb) => {
            if (args[0] === `rest-server` && type === `line`) {
              cb(Buffer.from(`Some error`))
            }
          },
          once: () => {}
        },
        on: (type, cb) => {
          if (args[0] === `init` && type === `exit`) {
            cb(0)
          }
          if (args[0] === `rest-server` && type === `exit`) {
            setImmediate(() => {
              cb(1)
            })
          }
          if (args[0] === `keys` && args[1] === `delete` && type === `exit`) {
            cb(0)
          }
        }
      }))
      let { send } = require(`electron`)
      await require(appRoot + `src/main/index.js`)

      expect(send).toHaveBeenCalledWith(`error`, {
        message: `The gaiacli rest-server (LCD) experienced an error:\nSome error`
      })
    })
  })
})

function mainSetup() {
  beforeAll(async function() {
    main = await initMain()
  })
}

// prepare mocks before we start the main process
function prepareMain() {
  // restart main with a now initialized state
  jest.resetModules()

  childProcessMock((path, args) => ({
    stdin: { write: () => {} },
    stdout: stdoutMocks(path, args),
    on: (type, cb) => {
      if (args[0] === `init` && type === `exit`) {
        cb(0)
      }
      if (args[0] === `rest-server` && type === `exit`) {
        // needs to be deferred because the callback overrides a variable
        setImmediate(() => {
          cb(0)
        })
      }
      if (args[0] === `keys` && args[1] === `delete` && type === `exit`) {
        cb(0)
      }
    }
  }))
  childProcess = require(`child_process`)
  jest.doMock(`renderer/connectors/lcdClient.js`, () => {
    return () => ({
      nodeVersion: async () => `0.13.0`
    })
  })

  // have the same mocked fs as main uses
  // this is reset with jest.resetModules
  fs = require(`fs-extra`)
}

async function initMain() {
  prepareMain()

  main = await require(appRoot + `src/main/index.js`)
  expect(main).toBeDefined()
  return main
}

function childProcessMock(mockExtend = () => ({})) {
  jest.doMock(`child_process`, () => ({
    spawn: jest.fn((path, args) =>
      Object.assign(mockSpawnReturnValue(), mockExtend(path, args))
    )
  }))
}

// sometime we want to simulate a sequential run of the UI
// usualy we want to clean up all the modules after each run but in this case, we want to persist the mocked filesystem
function resetModulesKeepingFS() {
  let fileSystem = fs.fs
  jest.resetModules()
  fs = require(`fs-extra`)
  fs.fs = fileSystem
}

function mockConfig() {
  jest.mock(`app/src/config.js`, () => ({
    name: `Cosmos Voyager`,
    wds_port: 9080,
    lcd_port: 9070,
    lcd_port_prod: 9071,
    relay_port: 9060,
    relay_port_prod: 9061,

    node_lcd: `http://awesomenode.de:1317`,
    node_rpc: `http://awesomenode.de:26657`,

    default_network: `gaia-5001`,
    mocked: false,

    google_analytics_uid: `UA-51029217-3`,
    sentry_dsn: `https://abc:def@sentry.io/288169`,
    sentry_dsn_public: `https://abc@sentry.io/288169`
  }))
}
