"use strict"

let runDev = require(`./runner.js`)
let config = require(`../app/src/config.js`)
const path = require(`path`)
const userHome = require(`user-home`)
const { startLocalNode } = require(`./gaia.js`)

async function main() {
  const network = process.argv[2] || config.default_network

  let extendedEnv = {}

  if (network === `local-testnet`) {
    extendedEnv = {
      LCD_URL: `https://localhost:9070`,
      RPC_URL: `http://localhost:26657`
    }
    const TESTNET_NODE_FOLDER = path.join(userHome, `.gaiad-testnet`)
    startLocalNode(TESTNET_NODE_FOLDER)
  }

  // run Voyager in a development environment
  let children = await runDev(`./app/networks/${network}/`, extendedEnv)

  // kill all development processes if master process fails
  process.on(`exit`, () => {
    children.forEach(child => child.kill(`SIGKILL`))
  })
  children.forEach(child => child.on(`exit`, () => process.exit()))
}

main().catch(function(error) {
  console.error(`Starting the application failed`, error)
})
