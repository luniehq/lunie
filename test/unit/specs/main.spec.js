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
  spawn: () => ({
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
  })
}))

let main
let root = '../../../'
let appRoot = root + 'app/'
let testRoot = './test/unit/tmp/test_root/'

describe('Startup Process', () => {
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
      await fs.ensureDir('./test/unit/tmp')
      await fs.remove('./test/unit/tmp')
      await fs.ensureDir('./test/unit/tmp')
      // await fs.ensureFile('./test/unit/tmp/test_root/priv_validator.json')
      main = await require(appRoot + 'src/main/index.js').default
    })

    it('should create the config dir', async function () {
      expect(fs.pathExistsSync(testRoot)).toBe(true)
    })

    it('should persist the app_version', async function () {
      expect(fs.pathExistsSync(testRoot + 'app_version')).toBe(true)
      let appVersion = fs.readFileSync(testRoot + 'app_version', 'utf8')
      expect(appVersion).toBe('123')
    })

    afterAll(() => {
      main.shutdown()
      // fs.removeSync('./test/unit/tmp')
    })
  })
})
