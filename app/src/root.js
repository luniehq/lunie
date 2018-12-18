"use strict"

const { COSMOS_HOME, NODE_ENV } = process.env

if (COSMOS_HOME) {
  module.exports = COSMOS_HOME
} else {
  const { resolve, join } = require(`path`)
  const networkName = require(`./network.js`).name
  const appDir = resolve(`${__dirname}/../../`)
  const buildTestnetPath = join(appDir, `builds`, `testnets`)

  const { name } = require(`../../package.json`)
  const DEV = NODE_ENV === `development`
  const appName = name.toLowerCase()
  const appDirName = `${appName}${DEV ? `-dev` : ``}`

  module.exports = join(buildTestnetPath, networkName, appDirName)
}
