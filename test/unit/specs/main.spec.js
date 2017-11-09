const fs = require('fs-extra')
const rmdir = require('../../../app/src/helpers/rmdir.js')

jest.mock('electron', () => {
  return {
    app: {
      on: () => { }
    }
  }
})
jest.mock('child_process', () => ({
  spawn: jest.fn((name, args) => ({
    stdout: {
      on: () => { },
      pipe: () => { }
    },
    stderr: {
      on: () => { },
      pipe: () => { }
    },
    on: (type, cb) => {
      // init processes always should return with 0
      if (type === 'exit' && args[0] === 'init') {
        cb(0)
      }
    },
    kill: () => { }
  }))
}))

let main
let root = '../../../'
let appRoot = root + 'app/'
let testRoot = './test/unit/tmp/test_root/'
let childProcess

describe('Startup Process', () => {
  Object.assign(process.env, {
    COSMOS_TEST: true,
    COSMOS_NETWORK: 'app/networks/tak',
    COSMOS_HOME: testRoot
  })

  jest.mock(appRoot + 'src/root.js', () => './test/unit/tmp/test_root')
  jest.mock(appRoot + 'node_modules/event-to-promise', () => () => Promise.resolve({
    toString: () => 'Serving on'
  }))
  // TODO: clarify if app_version should be taken from nested package.json
  jest.mock(root + 'app/package.json', () => ({
    version: '0.1.1'
  }))
  tendermintMock()

  describe('Initialization', function () {
    beforeAll(async function () {
      await resetConfigs()
    })
    mainSetup()

    it('should create the config dir', async function () {
      expect(fs.pathExistsSync(testRoot)).toBe(true)
    })

    it('should init basecoin', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('basecoin') &&
          args.includes('init')
        )
      ).toBeDefined()
    })

    it('should start basecoin', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('basecoin') &&
          args.includes('start')
        )
      ).toBeDefined()
      expect(main.processes.basecoinProcess).toBeDefined()
    })

    it('should start tendermint', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('tendermint') &&
          args.includes('node')
        )
      ).toBeDefined()
      expect(main.processes.tendermintProcess).toBeDefined()
    })

    it('should init baseserver with correct testnet', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('baseserver') &&
          args.includes('init') &&
          args.splice(1).join('=').includes('--chain-id=tak')
        )
      ).toBeDefined()
    })

    it('should start baseserver', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('baseserver') &&
          args.includes('serve')
        )
      ).toBeDefined()
      expect(main.processes.baseserverProcess).toBeDefined()
    })

    it('should persist the app_version', async function () {
      expect(fs.pathExistsSync(testRoot + 'app_version')).toBe(true)
      let appVersion = fs.readFileSync(testRoot + 'app_version', 'utf8')
      expect(appVersion).toBe('0.1.1')
    })
  })

  // TODO
  // describe('Initialization in dev mode', function () {
  //   beforeAll(async function () {
  //     await resetConfigs()

  //     Object.assign(process.env, {
  //       NODE_ENV: 'development'
  //     })
  //   })

  //   afterAll(() => {
  //     Object.assign(process.env, {
  //       NODE_ENV: null
  //     })
  //   })
  //   mainSetup()

  //   it('should create the config dir', async function () {
  //     expect(fs.pathExistsSync(testRoot)).toBe(true)
  //   })

  //   it('should init basecoin', async function () {
  //     expect(childProcess.spawn.mock.calls
  //       .find(([path, args]) =>
  //         path.includes('basecoin') &&
  //         args.includes('init')
  //       )
  //     ).toBeDefined()
  //   })

  //   it('should start basecoin', async function () {
  //     expect(childProcess.spawn.mock.calls
  //       .find(([path, args]) =>
  //         path.includes('basecoin') &&
  //         args.includes('start')
  //       )
  //     ).toBeDefined()
  //     expect(main.processes.basecoinProcess).toBeDefined()
  //   })

  //   it('should start tendermint', async function () {
  //     expect(childProcess.spawn.mock.calls
  //       .find(([path, args]) =>
  //         path.includes('tendermint') &&
  //         args.includes('node')
  //       )
  //     ).toBeDefined()
  //     expect(main.processes.tendermintProcess).toBeDefined()
  //   })

  //   it('should init baseserver with correct testnet', async function () {
  //     expect(childProcess.spawn.mock.calls
  //       .find(([path, args]) =>
  //         path.includes('baseserver') &&
  //         args.includes('init') &&
  //         args.splice(1).join('=').includes('--chain-id=tak')
  //       )
  //     ).toBeDefined()
  //   })

  //   it('should start baseserver', async function () {
  //     expect(childProcess.spawn.mock.calls
  //       .find(([path, args]) =>
  //         path.includes('baseserver') &&
  //         args.includes('serve')
  //       )
  //     ).toBeDefined()
  //     expect(main.processes.baseserverProcess).toBeDefined()
  //   })

  //   it('should persist the app_version', async function () {
  //     expect(fs.pathExistsSync(testRoot + 'app_version')).toBe(true)
  //     let appVersion = fs.readFileSync(testRoot + 'app_version', 'utf8')
  //     expect(appVersion).toBe('0.1.1')
  //   })

  //   xit('should have set the own node as a validator with 100% voting power', async () => {
  //     resetConfigs()

  //     await fs.writeFile(join(testRoot, 'priv_validator.json'), {
  //       pub_key: '123'
  //     }, 'utf8')

  //     await initMain()

  //     let genesis = await fs.readFile(join(testRoot, 'genesis.json'))
  //     let validators = JSON.parse(genesis).validators
  //     expect(validators.length).toBe(1)
  //     expect(validators[0].power).toBe(100)
  //     expect(validators[0].pub_key).toBe('123')
  //   })
  // })

  describe('Start initialized', function () {
    mainSetup()

    it('should not init basecoin again', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('basecoin') &&
          args.includes('init')
        )
      ).toBeUndefined()
    })

    it('should start basecoin', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('basecoin') &&
          args.includes('start')
        )
      ).toBeDefined()
      expect(main.processes.basecoinProcess).toBeDefined()
    })

    it('should start tendermint', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('tendermint') &&
          args.includes('node')
        )
      ).toBeDefined()
      expect(main.processes.tendermintProcess).toBeDefined()
    })

    it('should not init baseserver again', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('baseserver') &&
          args.includes('init')
        )
      ).toBeUndefined()
    })

    it('should start baseserver', async function () {
      expect(childProcess.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('baseserver') &&
          args.includes('serve')
        )
      ).toBeDefined()
      expect(main.processes.baseserverProcess).toBeDefined()
    })
  })

  describe('Update app version', function () {
    beforeAll(() => {
      jest.mock(root + 'app/package.json', () => ({
        version: '1.1.1'
      }))
    })
    mainSetup()

    it('should backup the genesis.json', async function () {
      expect(fs.pathExistsSync(testRoot.substr(0, testRoot.length - 1) + '_backup_1/genesis.json')).toBe(true)
    })
  })

  describe('Update genesis.json', function () {
    beforeAll(async function () {
      let existingGenesis = JSON.parse(fs.readFileSync(testRoot + 'genesis.json', 'utf8'))
      existingGenesis.genesis_time = (new Date()).toString()
      fs.writeFileSync(testRoot + 'genesis.json', JSON.stringify(existingGenesis))
    })
    mainSetup()

    it('should backup the genesis.json', async function () {
      expect(fs.pathExistsSync(testRoot.substr(0, testRoot.length - 1) + '_backup_1/genesis.json')).toBe(true)
    })
  })

  describe('Error handling', function () {
    afterEach(function () {
      main.shutdown()
    })

    it('should rerun tendermint if tendermint fails to connect as it is polled until alive', async function () {
      jest.mock(appRoot + 'node_modules/tendermint', () => {
        let i = 0
        return () => ({
          status: (cb) => {
            if (i < 3) {
              cb({ code: 'ECONNREFUSED' })
              i++
            } else {
              cb(null, {
                latest_block_height: 1
              })
            }
          }
        })
      })
      jest.resetModules()
      main = await require(appRoot + 'src/main/index.js')
      expect(main).toBeDefined()
    })

    it('should fail if there is a not handled error in the tendermint rpc client', async function (done) {
      jest.mock(appRoot + 'node_modules/tendermint', () => () => ({
        status: (cb) => cb({code: 'EPERM'})
      }))
      jest.resetModules()
      await require(appRoot + 'src/main/index.js')
        .catch(err => {
          expect(err.message).toContain('Tendermint produced an unexpected error')
          done()
        })
    })

    it('should rerun baseserver if baseserver fails', async function () {
      tendermintMock()
      failingChildProcess('baseserver', 'serve')
      jest.resetModules()
      main = await require(appRoot + 'src/main/index.js')
      expect(main).toBeDefined()
    })

    // TODO exception is not catched by the main.catch
    // testFailingChildProcess('tendermint')
  })

  describe('Error handling on init', () => {
    beforeAll(async function () {
      await resetConfigs()
    })
    testFailingChildProcess('basecoin', 'init')
    testFailingChildProcess('baseserver', 'init')
  })

  describe('Electron startup', () => {
    // TODO
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
  main = await require(appRoot + 'src/main/index.js')
  expect(main).toBeDefined()
}

function tendermintMock () {
  jest.mock(appRoot + 'node_modules/tendermint', () => () => ({
    status: (cb) => cb(null, {
      latest_block_height: 1
    })
  }))
}

function testFailingChildProcess (name, cmd) {
  return it(`should fail if there is a not handled error in the ${name} ${cmd || ''} process`, async function (done) {
    tendermintMock()
    failingChildProcess(name, cmd)
    jest.resetModules()
    await require(appRoot + 'src/main/index.js')
      .catch(err => {
        expect(err.message.toLowerCase()).toContain(name)
        done()
      })
  })
}

function failingChildProcess (mockName, mockCmd) {
  jest.mock('child_process', () => ({
    spawn: jest.fn((path, args) => ({
      stdout: {
        on: () => { },
        pipe: () => { }
      },
      stderr: {
        on: () => { },
        pipe: () => { }
      },
      on: (type, cb) => {
        if (type === 'exit') {
          if (path.includes(mockName) && (mockCmd === undefined || args[0] === mockCmd)) {
            cb(-1)
            // init processes always should return with 0
          } else if (args[0] === 'init') {
            cb(0)
          }
        }
      },
      kill: () => { }
    }))
  }))
}

async function resetConfigs () {
  if (fs.pathExistsSync('./test/unit/tmp')) {
    // fs.removeSync did produce an ENOTEMPTY error under windows
    await rmdir('./test/unit/tmp')
    expect(fs.pathExistsSync('./test/unit/tmp')).toBe(false)
  } else {
    fs.ensureDirSync('./test/unit/tmp')
  }
}
