const { join } = require('path')
const mockFsExtra = require('../helpers/fs-mock').default

// prevents warnings from repeated event handling
process.setMaxListeners(1000)

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

jest.mock('fs-extra', () => {
  let fs = require('fs')
  let mockFs = mockFsExtra()
  mockFs.writeFile('./app/networks/gaia-2/config.toml', fs.readFileSync('./app/networks/gaia-2/config.toml', 'utf8'))
  mockFs.writeFile('./app/networks/gaia-2/genesis.json', fs.readFileSync('./app/networks/gaia-2/genesis.json', 'utf8'))
  mockFs.writeFile('./app/networks/gaia-2/gaiaversion.txt', fs.readFileSync('./app/networks/gaia-2/gaiaversion.txt', 'utf8'))
  return mockFs
})
let fs = require('fs-extra')

jest.mock('electron', () => {
  let electron = {
    app: {
      on: (event, cb) => {
        if (event === 'ready') cb()
      }
    },
    send: jest.fn(), // NOT ELECTRON, used to test ipc calls to mainWindow.webContents.send
    BrowserWindow: class MockBrowserWindow {
      constructor () {
        this.webContents = {
          openDevTools: () => { },
          on: () => { },
          send: electron.send
        }
      }
      loadURL () { }
      on () { }
      maximize () { }
    },
    Menu: {
      buildFromTemplate () { },
      setApplicationMenu () { }
    },
    ipcMain: { on: () => { } }
  }
  return electron
})
childProcessMock((path, args) => ({
  on: (type, cb) => {
    // init processes always should return with 0
    if (type === 'exit' && args[1] === 'init' && args.length > 4) {
      cb(0)
    }
  },
  stdout: {
    on: (type, cb) => {
      if (args[0] === 'version' && type === 'data') {
        cb({ toString: () => 'v0.5.0' })
      }
    }
  },
  stderr: {
    on: (type, cb) => {
      // test for init of gaia
      if (type === 'data' && args[1] === 'init' && args.length === 4) {
        cb({ toString: () => 'already is initialized' })
      }
    }
  }
}))

let main
let root = '../../../'
let appRoot = root + 'app/'
let testRoot = './test/unit/tmp/test_root/'
let childProcess

describe('Startup Process', () => {
  Object.assign(process.env, {
    COSMOS_ANALYTICS: false,
    LOGGING: false,
    COSMOS_NETWORK: 'app/networks/gaia-2',
    COSMOS_HOME: testRoot,
    NODE_ENV: 'testing'
  })

  jest.mock(appRoot + 'src/root.js', () => './test/unit/tmp/test_root')
  jest.mock('event-to-promise', () => {
    let i = 0
    return () => Promise.resolve({
      toString: () => {
        if (i++ >= 1) {
          return 'Serving on'
        } else {
          return 'Test'
        }
      }
    })
  })

  // uses package.json from voyager/ root.
  jest.mock(root + 'package.json', () => ({ version: '0.1.0' }))

  // removed mocked genesis.json for these tests to check if starting up works
  beforeAll(() => {
    fs.removeSync(testRoot + 'genesis.json')
  })

  describe('Initialization', function () {
    mainSetup()

    it('should create the config dir', async function () {
      expect(fs.existsSync(testRoot)).toBe(true)
    })

    it('should init gaia server with correct testnet', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('gaia') &&
          args.includes('client') &&
          args.includes('init') &&
          args.join('=').includes('--chain-id=gaia-2')
        )
      ).toBeDefined()
    })

    it('should start gaia server', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('gaia') &&
          args.includes('rest-server')
        )
      ).toBeDefined()
      expect(main.processes.lcdProcess).toBeDefined()
    })

    it('should persist the app_version', async function () {
      expect(fs.existsSync(testRoot + 'app_version')).toBe(true)
      let appVersion = fs.readFileSync(testRoot + 'app_version', 'utf8')
      expect(appVersion).toBe('0.1.0')
    })

    // TODO the stdout.on('data') trick doesn't work
    xit('should init gaia server accepting the new app hash', async function () {
      jest.resetModules()
      let mockWrite = jest.fn()
      childProcessMock((path, args) => ({
        stdin: { write: mockWrite },
        stdout: {
          on: (type, cb) => {
            if (type === 'data' && path.includes('gaia') && args[0] === 'server' && args[1] === 'init') {
              cb('Will you accept the hash?')
            }
          }
        }
      }))
      jest.resetModules()
      main = await require(appRoot + 'src/main/index.js')
      expect(mockWrite).toHaveBeenCalledWith('y\n')
    })
  })

  describe('Initialization in dev mode', function () {
    beforeAll(async function () {
      jest.resetModules()

      Object.assign(process.env, {
        NODE_ENV: 'development',
        LOGGING: false
      })
    })

    afterAll(() => {
      Object.assign(process.env, { NODE_ENV: null })
    })
    mainSetup()

    it('should create the config dir', async function () {
      expect(fs.existsSync(testRoot)).toBe(true)
    })

    // TODO the stdout.on('data') trick doesn't work
    xit('should init gaia accepting the new app hash', async function () {
      jest.resetModules()
      let mockWrite = jest.fn()
      childProcessMock((path, args) => ({
        stdin: { write: mockWrite },
        stdout: {
          on: (type, cb) => {
            if (type === 'data' && path.includes('gaia') && args[0] === 'server' && args[1] === 'init') {
              cb('Will you accept the hash?')
            }
          }
        }
      }))
      jest.resetModules()
      main = await require(appRoot + 'src/main/index.js')
      expect(mockWrite).toHaveBeenCalledWith('y\n')
    })
  })

  describe('Initialization in dev mode', function () {
    beforeAll(async function () {
      jest.resetModules()

      Object.assign(process.env, {
        NODE_ENV: 'development',
        LOGGING: false
      })
    })

    afterAll(() => {
      Object.assign(process.env, { NODE_ENV: null })
    })
    mainSetup()

    it('should create the config dir', async function () {
      expect(fs.existsSync(testRoot)).toBe(true)
    })

    it('should init gaia server with correct testnet', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('gaia') &&
          args.includes('client') &&
          args.includes('init') &&
          args.join('=').includes('--chain-id=gaia-2')
        )
      ).toBeDefined()
    })

    it('should start gaia server', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('gaia') &&
          args.includes('rest-server')
        )
      ).toBeDefined()
      expect(main.processes.lcdProcess).toBeDefined()
    })

    it('should persist the app_version', async function () {
      expect(fs.existsSync(testRoot + 'app_version')).toBe(true)
      let appVersion = fs.readFileSync(testRoot + 'app_version', 'utf8')
      expect(appVersion).toBe('0.1.0')
    })
  })

  describe('Start initialized', function () {
    mainSetup()

    it('should not init gaia server again', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('gaia') &&
          args.includes('server') &&
          args.includes('init')
        )
      ).toBeUndefined()
    })

    it('should start gaia server', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('gaia') &&
          args.includes('rest-server')
        )
      ).toBeDefined()
      expect(main.processes.lcdProcess).toBeDefined()
    })
  })

  describe('Update app version', function () {
    mainSetup()

    it('should not replace the existing data', async function () {
      resetModulesKeepingFS()
      // alter the version so the main thread assumes an update
      jest.mock(root + 'package.json', () => ({ version: '1.1.1' }))
      let { send } = require('electron')
      await require(appRoot + 'src/main/index.js')

      expect(send.mock.calls[0][0]).toBe('error')
      expect(send.mock.calls[0][1].message).toContain('incompatible app version')

      let appVersion = fs.readFileSync(testRoot + 'app_version', 'utf8')
      expect(appVersion).toBe('0.1.0')
    })
  })

  describe('Update genesis.json', function () {
    mainSetup()

    it('should error on changed genesis.json', async function () {
      resetModulesKeepingFS()
      // alter the genesis so the main thread assumes a change
      let existingGenesis = JSON.parse(fs.readFileSync(testRoot + 'genesis.json', 'utf8'))
      existingGenesis.genesis_time = (new Date()).toString()
      fs.writeFileSync(testRoot + 'genesis.json', JSON.stringify(existingGenesis))

      let { send } = require('electron')
      await require(appRoot + 'src/main/index.js')

      expect(send.mock.calls[0][0]).toBe('error')
      expect(send.mock.calls[0][1].message).toContain('Genesis has changed')
    })
  })

  describe('Enable analytics', () => {
    let main
    beforeEach(() => {
      jest.resetModules()
    })

    afterEach(() => {
      main.shutdown()
    })

    it('should enable analytics with analytics flag', async () => {
      Object.assign(process.env, { COSMOS_ANALYTICS: true })
      main = await initMain()
      expect(main.analytics).toBe(true)
    })

    it('should enable analytics if production and testnet', async () => {
      jest.mock('../../../config.js', () => ({
        default_network: 'test-network',
        analytics_networks: ['test-network']
      }))
      Object.assign(process.env, { NODE_ENV: 'production' })
      main = await initMain()
      expect(main.analytics).toBe(true)
    })

    it('should prefer env variable over config', async () => {
      jest.mock('../../../config.js', () => ({
        default_network: 'test-network',
        analytics_networks: ['test-network']
      }))
      Object.assign(process.env, {
        COSMOS_ANALYTICS: false,
        NODE_ENV: 'production'
      })
      main = await initMain()
      expect(main.analytics).toBe(false)
    })

    it('should disable analytics if production and not a testnet', async () => {
      jest.mock('../../../config.js', () => ({
        default_network: 'production-network',
        analytics_networks: ['test-network']
      }))
      Object.assign(process.env, { NODE_ENV: 'production' })
      main = await initMain()
      expect(main.analytics).toBe(false)
    })
  })

  describe('IPC', () => {
    let registeredIPCListeners = {}

    beforeEach(async function () {
      prepareMain()
      // register ipc listeners
      const { ipcMain } = require('electron')
      ipcMain.on = (type, cb) => {
        registeredIPCListeners[type] = cb
      }
      // axios is used to ping nodes for the reconnection intent
      let axios = require('axios')
      axios.get = () => Promise.resolve()
      main = await require(appRoot + 'src/main/index.js')
    })

    afterEach(function () {
      main.shutdown()
      registeredIPCListeners = {}
    })

    it('should reconnect on IPC call', async () => {
      const { send } = require('electron')
      await registeredIPCListeners['reconnect']()

      expect(send.mock.calls[1][0]).toBe('connected')
    })

    it('should not start reconnecting again if already trying to reconnect', async () => {
      let axios = require('axios')
      let spy = jest.spyOn(axios, 'get')

      registeredIPCListeners['reconnect']()
      await registeredIPCListeners['reconnect']()
      expect(spy).toHaveBeenCalledTimes(1) // a node has only be pinged once
    })

    it('should search through nodes until it finds one', async () => {
      const { send } = require('electron')
      let axios = require('axios')
      axios.get = jest.fn()
        .mockReturnValueOnce(Promise.reject())
        .mockReturnValueOnce(Promise.resolve())

      await registeredIPCListeners['reconnect']()

      expect(send.mock.calls[1][0]).toBe('connected')
    })

    it('should print a success message if connected to node', async () => {
      let consoleSpy = jest.spyOn(console, 'log')
      registeredIPCListeners['successful-launch']()
      expect(consoleSpy.mock.calls[0][0]).toContain('[START SUCCESS]')

      consoleSpy.mockRestore()
    })

    it('should provide the connected node when the view has booted', async () => {
      let event = { sender: { send: jest.fn() } }
      registeredIPCListeners['booted'](event)
      expect(event.sender.send.mock.calls[0][0]).toEqual('connected')
      expect(event.sender.send.mock.calls[0][1]).toBeTruthy() // TODO fix seeds so we can test nodeIP output
    })

    it('should provide the error if the main process failed before the view has booted', async () => {
      main.shutdown()

      // simulate error by deleting a file
      resetModulesKeepingFS()
      fs.removeSync(join(testRoot, 'genesis.json'))

      // register listeners again
      const { ipcMain } = require('electron')
      ipcMain.on = (type, cb) => {
        registeredIPCListeners[type] = (...args) => cb(...args)
      }

      // run main
      main = await require(appRoot + 'src/main/index.js')

      let event = { sender: { send: jest.fn() } }
      registeredIPCListeners['booted'](event)
      expect(event.sender.send.mock.calls[0][0]).toEqual('error')
      expect(event.sender.send.mock.calls[0][1]).toBeTruthy() // TODO fix seeds so we can test nodeIP output
    })
  })

  describe('Error handling', function () {
    afterEach(function () {
      main.shutdown()
    })
    it('should rerun gaia server if gaia server fails', async function () {
      failingChildProcess('gaia', 'rest-server')
      main = await initMain()

      await sleep(1000)

      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('gaia') &&
          args.includes('rest-server')
        ).length
      ).toBeGreaterThan(1)
    })

    it('should fail if config.toml has no seeds', async () => {
      jest.resetModules()
      main = await initMain()
      main.shutdown()
      let configText = fs.readFileSync(join(testRoot, 'config.toml'), 'utf8')
      configText = configText.split('\n')
        .map(line => {
          if (line.startsWith('seeds')) {
            return 'seeds = ""'
          } else {
            return line
          }
        }).join('\n')
      fs.writeFileSync(join(testRoot, 'config.toml'), configText, 'utf8')

      resetModulesKeepingFS()
      let { send } = require('electron')
      main = await require(appRoot + 'src/main/index.js')

      expect(send.mock.calls[0][0]).toBe('error')
      expect(send.mock.calls[0][1].message).toContain('seeds')
    })

    describe('missing files', () => {
      let send

      beforeEach(async () => {
        // make sure it is initialized
        jest.resetModules()
        main = await initMain()
        main.shutdown()

        resetModulesKeepingFS()
        let { send: _send } = require('electron')
        send = _send
      })
      afterEach(async () => {
        main.shutdown()
      })
      it('should error if the genesis.json being removed', async () => {
        fs.removeSync(join(testRoot, 'genesis.json'))
        main = await require(appRoot + 'src/main/index.js')

        expect(send.mock.calls[0][0]).toBe('error')
      })
      it('should error if the config.toml being removed', async () => {
        fs.removeSync(join(testRoot, 'config.toml'))
        main = await require(appRoot + 'src/main/index.js')

        expect(send.mock.calls[0][0]).toBe('error')
      })
      it('should error if the app_version being removed', async () => {
        fs.removeSync(join(testRoot, 'app_version'))
        main = await require(appRoot + 'src/main/index.js')

        expect(send.mock.calls[0][0]).toBe('error')
      })
      it('should survive the lcd folder being removed', async () => {
        fs.removeSync(join(testRoot, 'lcd'))
        resetModulesKeepingFS()
        let { send } = require('electron')
        main = await require(appRoot + 'src/main/index.js')

        expect(childProcess.spawn.mock.calls
          .find(([path, args]) =>
            path.includes('gaia') &&
            args.includes('init')
          ).length
        ).toBe(3) // one to check in first round, one to check + one to init in the second round

        expect(send.mock.calls[0][0]).toBe('connected')
      })
    })
  })

  describe('Error handling on init', () => {
    beforeEach(async function () {
      jest.resetModules()
    })
    testFailingChildProcess('gaia', 'init')
  })
})

function mainSetup () {
  beforeAll(async function () {
    main = await initMain()
  })

  afterAll(function () {
    main.shutdown()
  })
}

// prepare mocks before we start the main process
function prepareMain () {
  // restart main with a now initialized state
  jest.resetModules()
  childProcess = require('child_process')
  // have the same mocked fs as main uses
  // this is reset with jest.resetModules
  fs = require('fs-extra')
  const Raven = require('raven')
  Raven.disableConsoleAlerts()
}

async function initMain () {
  prepareMain()

  main = await require(appRoot + 'src/main/index.js')
  expect(main).toBeDefined()
  return main
}

function testFailingChildProcess (name, cmd) {
  return it(`should fail if there is a not handled error in the ${name} ${cmd || ''} process`, async function () {
    failingChildProcess(name, cmd)
    jest.resetModules()
    let { send } = require('electron')
    await require(appRoot + 'src/main/index.js')

    expect(send.mock.calls[0][0]).toBe('error')
    expect(send.mock.calls[0][1].message).toContain(name)
  })
}

function childProcessMock (mockExtend = () => ({})) {
  jest.mock('child_process', () => ({
    spawn: jest.fn((path, args) => Object.assign({}, {
      stdout: {
        on: () => { },
        pipe: () => { }
      },
      stderr: {
        on: () => { },
        pipe: () => { }
      },
      on: () => { },
      kill: () => { }
    }, mockExtend(path, args)))
  }))
}

function failingChildProcess (mockName, mockCmd) {
  childProcessMock((path, args) => ({
    on: (type, cb) => {
      if (type === 'exit') {
        if (path.includes(mockName) && (mockCmd === undefined || args[1] === mockCmd)) {
          cb(-1)
          // init processes always should return with 0
        } else if (args[1] === 'init') {
          cb(0)
        }
      }
    },
    stdout: {
      on: (type, cb) => {
        if (args[0] === 'version' && type === 'data') {
          cb({ toString: () => 'v0.5.0' })
        }
      }
    },
    stderr: {
      on: (type, cb) => {
        // test for init of gaia
        if (type === 'data' && args[1] === 'init' && args.length === 4) {
          cb({ toString: () => 'already is initialized' })
        }
      }
    }
  }))
}

// sometime we want to simulate a sequential run of the UI
// usualy we want to clean up all the modules after each run but in this case, we want to persist the mocked filesystem
function resetModulesKeepingFS () {
  let fileSystem = fs.fs
  jest.resetModules()
  fs = require('fs-extra')
  fs.fs = fileSystem
}
