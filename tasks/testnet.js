"use strict"

let runner = require(`./runner.js`)
let config = require(`../app/src/config.js`)
const fs = require(`fs-extra`)
const { join, resolve } = require(`path`)
const {
  startNodes,
  buildNodes,
  setupAccounts
} = require(`./build/local/helper`)
const appDir = resolve(`${__dirname}/../`)
const buildTestnetPath = join(appDir, `builds`, `testnets`)

async function main() {
  const network = process.argv[2] || config.default_network
  const numberNodes = parseInt(process.argv[3], 10) || 1

  let extendedEnv = {}
  let networkPath = `./app/networks/${network}/`

  if (network === `local-testnet`) {
    const { cliHomePrefix, nodes, mainAccountSignInfo } = await buildNodes(
      join(buildTestnetPath, network),
      {
        chainId: network,
        password: `1234567890`,
        overwrite: false,
        moniker: `local`,
        keyName: `main-account`
      },
      numberNodes
    )
    await startNodes(nodes, mainAccountSignInfo, network)
    fs.copySync(join(nodes[1].home, `config`), cliHomePrefix)
    let { version } = require(`../package.json`)
    fs.writeFileSync(`${cliHomePrefix}/app_version`, version)
    networkPath = cliHomePrefix // join(nodes[1].home, `config`)
    extendedEnv = {
      LCD_URL: `https://localhost:9070`,
      RPC_URL: `http://localhost:26657`,
      COSMOS_HOME: cliHomePrefix
    }
    await setupAccounts(nodes[1].cliHome, join(cliHomePrefix, `lcd`), {
      keyName: `local-test`
    })
  }

  // run Voyager in a development environment
  let children = await runner(networkPath, extendedEnv)

  // kill all development processes if master process fails
  process.on(`exit`, () => {
    children.forEach(child => child.kill(`SIGKILL`))
  })
  children.forEach(child => child.on(`exit`, () => process.exit()))
}

main().catch(function(error) {
  console.error(`Starting the application failed`, error)
})
