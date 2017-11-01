const fs = require('fs-extra')
const {join} = require('path')
jest.mock('electron', () => {
  return {
    app: {
      on: () => {}
    }
  }
})
jest.mock('child_process', () => ({
  spawn: jest.fn(() => ({
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
  }))
}))

let main
let root = '../../../'
let appRoot = root + 'app/'
let testRoot = './test/unit/tmp/test_root/'

describe('Startup Process', () => {
  let child_process = require('child_process')
  Object.assign(process.env, {
    COSMOS_TEST: true,
    COSMOS_NETWORK: 'app/networks/local'
  })

  jest.mock(appRoot + 'src/root.js', () => './test/unit/tmp/test_root')
  // TODO: clarify if app_version should be taken from nested package.json
  jest.mock(root + 'app/package.json', () => ({
    version: '123'
  }))
  jest.mock(appRoot + 'node_modules/event-to-promise', () => () => Promise.resolve({
    toString: () => 'Serving on'
  }))
  jest.mock(appRoot + 'node_modules/tendermint', () => () => ({
    status: (cb) => cb(null, {
      latest_block_height: 1
    })
  }))

  describe('Initialization', function () {
    beforeAll(async function () {
      if (fs.pathExistsSync('./test/unit/tmp')) {
        // fs.removeSync did produce an ENOTEMPTY error under windows
        fs.removeSync('./test/unit/tmp')
      } else {
        fs.ensureDirSync('./test/unit/tmp')
      }
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
      expect(child_process.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('basecoin')
          && args.includes('init')
        )
      ).toBeDefined()
    })
    
    it('should start basecoin', async function () {
      expect(child_process.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('basecoin')
          && args.includes('start')
        )
      ).toBeDefined()
      expect(main.processes.basecoinProcess).toBeDefined()
    })
    
    it('should start tendermint', async function () {
      expect(child_process.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('tendermint')
          && args.includes('node')
        )
      ).toBeDefined()
      expect(main.processes.tendermintProcess).toBeDefined()
    })
    
    it('should init baseserver with correct testnet', async function () {
      expect(child_process.spawn.mock.calls
        .find(([path, args]) => 
          path.includes('baseserver')
          && args.includes('init')
          && args.splice(1).join('=').includes('--chain-id=local')
        )
      ).toBeDefined()
    })
    
    it('should start baseserver', async function () {
      expect(child_process.spawn.mock.calls
        .find(([path, args]) =>
          path.includes('baseserver')
          && args.includes('serve')
        )
      ).toBeDefined()
      expect(main.processes.baseserverProcess).toBeDefined()
    })

    it('should persist the app_version', async function () {
      expect(fs.pathExistsSync(testRoot + 'app_version')).toBe(true)
      let appVersion = fs.readFileSync(testRoot + 'app_version', 'utf8')
      expect(appVersion).toBe('123')
    })
  })
})