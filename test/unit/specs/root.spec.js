const { join } = require("path")
const { homedir } = require("os")

describe("Root UI Directory", () => {
  Object.assign(process.env, {
    NODE_ENV: "development",
    COSMOS_NETWORK: "app/networks/gaia-6002",
    COSMOS_HOME: ""
  })

  it("should create the correct path", () => {
    let root = require("../../../app/src/root.js")
    expect(root).toBe(join(homedir(), ".cosmos-voyager-dev/gaia-6002"))
  })

  it("should use COSMOS_HOME as default", () => {
    Object.assign(process.env, {
      COSMOS_HOME: "./abc"
    })
    jest.resetModules()
    let root = require("../../../app/src/root.js")
    expect(root).toBe("./abc")
  })
})
