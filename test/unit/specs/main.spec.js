const {join} = require('path')
const mockFsExtra = require('../helpers/fs-mock').default

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

jest.mock('fs-extra', () => {
  let fs = require('fs')
  let mockFs = mockFsExtra()
  mockFs.writeFile('./app/networks/gaia-2/config.toml', fs.readFileSync('./app/networks/gaia-2/config.toml', 'utf8'))
  mockFs.writeFile('./app/networks/gaia-2/genesis.json', fs.readFileSync('./app/networks/gaia-2/genesis.json', 'utf8'))
  return mockFs
})
let fs = require('fs-extra')

jest.mock('electron', () => {
  return {
    app: {
      on: () => { }
    }
  }
})
childProcessMock((path, args) => ({
  on: (type, cb) => {
    // init processes always should return with 0
    if (type === 'exit' && args[1] === 'init') {
      cb(0)
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
    COSMOS_TEST: true,
    COSMOS_NETWORK: 'app/networks/gaia-2',
    COSMOS_HOME: testRoot
  })

  jest.mock(appRoot + 'src/root.js', () => './test/unit/tmp/test_root')
  jest.mock('event-to-promise', () => {
    let i = 0
    return () => Promise.resolve({
      toString: () => {
        if (i++ === 1) {
          return 'Serving on'
        } else {
          return 'Test'
        }
      }
    })
  })

  // uses package.json from cosmos-ui/ root.
  jest.mock(root + 'package.json', () => ({
    version: '0.1.0'
  }))
  jest.mock(appRoot + 'src/main/relayServer.js', () => () => {})

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
      expect(main.processes.baseserverProcess).toBeDefined()
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
        stdin: {
          write: mockWrite
        },
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
      Object.assign(process.env, {
        NODE_ENV: null
      })
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
        stdin: {
          write: mockWrite
        },
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
      Object.assign(process.env, {
        NODE_ENV: null
      })
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
      expect(main.processes.baseserverProcess).toBeDefined()
    })

    it('should persist the app_version', async function () {
      expect(fs.existsSync(testRoot + 'app_version')).toBe(true)
      let appVersion = fs.readFileSync(testRoot + 'app_version', 'utf8')
      expect(appVersion).toBe('0.1.0')
    })

    xit('should have set the own node as a validator with 100% voting power', async () => {
      jest.resetModules()

      await fs.writeFile(join(testRoot, 'priv_validator.json'), {
        pub_key: '123'
      }, 'utf8')

      await initMain()

      let genesis = await fs.readFile(join(testRoot, 'genesis.json'))
      let validators = JSON.parse(genesis).validators
      expect(validators.length).toBe(1)
      expect(validators[0].power).toBe(100)
      expect(validators[0].pub_key).toBe('123')
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
      expect(main.processes.baseserverProcess).toBeDefined()
    })
  })

  describe('Update app version', function () {
    mainSetup()

    it('should backup the genesis.json', async function () {
      resetModulesKeepingFS()

      // alter the version so the main thread assumes an update
      jest.mock(root + 'package.json', () => ({
        version: '1.1.1'
      }))
      await require(appRoot + 'src/main/index.js')

      expect(fs.existsSync(testRoot.substr(0, testRoot.length - 1) + '_backup_1/genesis.json')).toBe(true)
    })
  })

  describe('Update genesis.json', function () {
    mainSetup()

    it('should backup the genesis.json', async function () {
      resetModulesKeepingFS()

      // alter the genesis so the main thread assumes a change
      let existingGenesis = JSON.parse(fs.readFileSync(testRoot + 'genesis.json', 'utf8'))
      existingGenesis.genesis_time = (new Date()).toString()
      fs.writeFileSync(testRoot + 'genesis.json', JSON.stringify(existingGenesis))
      await require(appRoot + 'src/main/index.js')

      expect(fs.existsSync(testRoot.substr(0, testRoot.length - 1) + '_backup_1/genesis.json')).toBe(true)
    })
  })

  describe('Error handling', function () {
    afterEach(function () {
      main.shutdown()
    })
    it('should rerun gaia server if gaia server fails', async function () {
      failingChildProcess('gaia', 'serve')
      await initMain()

      await sleep(1000)

      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
        path.includes('gaia') &&
        args.includes('rest-server')
      ).length
      ).toBeGreaterThan(1)
    })

    it('should fail if config.toml has no seeds', async (done) => {
      await initMain()
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
      await require(appRoot + 'src/main/index.js')
      .then(() => done.fail('Didnt fail'))
      .catch(err => {
        expect(err.message.toLowerCase()).toContain('seeds')
        done()
      })
    })

    describe('missing files', () => {
      beforeEach(async () => {
        // make sure it is initialized
        jest.resetModules()
        await initMain()
        main.shutdown()
      })
      afterEach(async () => {
        await main.shutdown()
        jest.resetModules()
      })
      it('should survive the genesis.json being removed', async () => {
        fs.removeSync(join(testRoot, 'genesis.json'))
        await initMain()
      })
      it('should survive the config.toml being removed', async () => {
        fs.removeSync(join(testRoot, 'config.toml'))
        await initMain()
      })
      it('should survive the app_version being removed', async () => {
        fs.removeSync(join(testRoot, 'app_version'))
        await initMain()
      })
      it('should survive the baseserver folder being removed', async () => {
        fs.removeSync(join(testRoot, 'baseserver'))
        await initMain()
      })
    })
  })

  describe('Error handling on init', () => {
    beforeEach(async function () {
      jest.resetModules()
    })
    testFailingChildProcess('gaia', 'init')
  })

  describe('Electron startup', () => {
  })
})

function mainSetup () {
  beforeAll(async function () {
    await initMain()
  })

  afterAll(function () {
    main.shutdown()
  })
}

async function initMain () {
  // restart main with a now initialized state
  jest.resetModules()
  childProcess = require('child_process')
  // have the same mocked fs as main uses
  // this is reset with jest.resetModules
  fs = require('fs-extra')
  main = await require(appRoot + 'src/main/index.js')
  expect(main).toBeDefined()
}

function testFailingChildProcess (name, cmd) {
  return it(`should fail if there is a not handled error in the ${name} ${cmd || ''} process`, async function (done) {
    failingChildProcess(name, cmd)
    jest.resetModules()
    await require(appRoot + 'src/main/index.js')
      .catch(err => {
        expect(err.message.toLowerCase()).toContain(name)
        done()
      })
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
