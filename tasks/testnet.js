"use strict"

let runner = require(`./runner.js`)
let config = require(`../app/src/config.js`)
const path = require(`path`)
const { startNodes, buildNodes } = require(`./build/local/helper`)
const appDir = path.resolve(`${__dirname}/../`)
const buildTestnetPath = path.join(appDir, `builds`, `testnets`)

async function main() {
  const network = process.argv[2] || config.default_network
  const numberNodes = parseInt(process.argv[3], 10) || 1

  let extendedEnv = {}
  let networkPath = `./app/networks/${network}/`

  if (network === `local-testnet`) {
    extendedEnv = {
      LCD_URL: `https://localhost:9070`,
      RPC_URL: `http://localhost:26657`
    }
    const { nodes, mainAccountSignInfo } = await buildNodes(
      path.join(buildTestnetPath, network),
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
    networkPath = path.join(nodes[1].home, `config`)
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
