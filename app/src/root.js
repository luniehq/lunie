const { COSMOS_HOME, NODE_ENV } = process.env

if (COSMOS_HOME) {
  module.exports = COSMOS_HOME
} else {
  const home = require("user-home")
  const { join } = require("path")
  const networkName = require("./network.js").name

  const { name } = require("../../package.json")
  const DEV = NODE_ENV === "development"
  const appName = name.toLowerCase()
  const appDirName = `.${appName}${DEV ? "-dev" : ""}`

  module.exports = join(home, appDirName, networkName)
}
