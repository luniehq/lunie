const { join, resolve } = require(`path`)
const mockFsExtra = require(`../helpers/fs-mock`).default

describe(`Root UI Directory`, () => {
  Object.assign(process.env, {
    NODE_ENV: `development`,
    COSMOS_NETWORK: `app/networks/gaia-6002`,
    COSMOS_HOME: ``
  })

  jest.mock(`fs-extra`, () => {
    let fs = require(`fs`)
    let mockFs = mockFsExtra()
    mockFs.writeFile(
      `./app/networks/gaia-6002/genesis.json`,
      fs.readFileSync(
        `./test/unit/helpers/mockNetworkConfig/genesis.json`,
        `utf8`
      )
    )
    return mockFs
  })

  it(`should create the correct path`, () => {
    let root = require(`../../../app/src/root.js`)
    const appDir = resolve(`${__dirname}/../../../`)
    expect(root).toBe(
      join(`${appDir}/builds/testnets/gaia-6002/cosmos-voyager-dev`)
    )
  })

  it(`should use COSMOS_HOME as default`, () => {
    Object.assign(process.env, {
      COSMOS_HOME: `./abc`
    })
    jest.resetModules()
    let root = require(`../../../app/src/root.js`)
    expect(root).toBe(`./abc`)
  })
})
