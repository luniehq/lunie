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
  spawn: jest.fn(() => ({
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
  }))
}))

let main
let root = '../../../'
let appRoot = root + 'app/'
let testRoot = './test/unit/tmp/test_root/'

describe('Startup Process', () => {
  let childProcess = require('child_process')
  Object.assign(process.env, {
    COSMOS_TEST: true,
    COSMOS_NETWORK: 'app/networks/tak'
  })

  jest.mock(appRoot + 'src/root.js', () => './test/unit/tmp/test_root')
  jest.mock(appRoot + 'node_modules/event-to-promise', () => () => Promise.resolve({
    toString: () => 'Serving on'
  }))
  tendermintMock()

  describe('Initialization', function () {
    beforeAll(async function () {
      await resetConfigs()
      // TODO: clarify if app_version should be taken from nested package.json
      jest.mock(root + 'app/package.json', () => ({
        version: '0.1.1'
      }))
      // await fs.ensureFile('./test/unit/tmp/test_root/priv_validator.json')
      main = await require(appRoot + 'src/main/index.js')
      expect(main).toBeDefined()
    })

    afterAll(async function () {
      await main.shutdown()
    })

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

  describe('Start initialized', function () {
    beforeAll(async function () {
      await main.shutdown()

      // restart main with a now initialized state
      jest.resetModules()
      childProcess = require('child_process')
      main = await require(appRoot + 'src/main/index.js')
      expect(main).toBeDefined()
    })

    afterAll(async function () {
      await main.shutdown()
    })

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
    beforeAll(async function () {
      await main.shutdown()

      jest.mock(root + 'app/package.json', () => ({
        version: '1.1.1'
      }))

      // restart main with a now initialized state
      jest.resetModules()
      main = await require(appRoot + 'src/main/index.js')
      expect(main).toBeDefined()
    })

    afterAll(async function () {
      await main.shutdown()
    })

    it('should backup the genesis.json', async function () {
      expect(fs.pathExistsSync(testRoot.substr(0, testRoot.length - 1) + '_backup_1/genesis.json')).toBe(true)
    })
  })

  describe('Update genesis.json', function () {
    beforeAll(async function () {
      await main.shutdown()

      let existingGenesis = JSON.parse(fs.readFileSync(testRoot + 'genesis.json', 'utf8'))
      existingGenesis.genesis_time = (new Date()).toString()
      fs.writeFileSync(testRoot + 'genesis.json', JSON.stringify(existingGenesis))

      // restart main with a now initialized state
      jest.resetModules()
      main = await require(appRoot + 'src/main/index.js')
      expect(main).toBeDefined()
    })

    afterAll(async function () {
      await main.shutdown()
    })

    it('should backup the genesis.json', async function () {
      expect(fs.pathExistsSync(testRoot.substr(0, testRoot.length - 1) + '_backup_1/genesis.json')).toBe(true)
    })
  })

  describe('Error handling', function () {
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
      failingChildProcess('baseserver', 'serve')
      jest.resetModules()
      main = await require(appRoot + 'src/main/index.js')
      expect(main).toBeDefined()
    })

    testFailingChildProcess('tendermint')

    // TODO unable to delete folders
    // describe('On Init', () => {
    //   beforeEach(async function () {
    //     await main.shutdown()
    //     sleep(2000)
    //     await resetConfigs()
    //   })

    //   testFailingChildProcess('basecoin', 'init')
    //   testFailingChildProcess('baseserver', 'init')
    // })
  })
})

function tendermintMock () {
  jest.mock(appRoot + 'node_modules/tendermint', () => () => ({
    status: (cb) => cb(null, {
      latest_block_height: 1
    })
  }))
}

function testFailingChildProcess (name, cmd) {
  return it(`should fail if there is a not handled error in the ${name} ${cmd || ''} process`, async function (done) {
    // stop streams and processes
    if (main) {
      await main.shutdown()
    }
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
  tendermintMock()
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
          } else {
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
