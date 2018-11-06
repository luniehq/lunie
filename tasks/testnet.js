"use strict"

let runDev = require(`./runner.js`)
let config = require(`../app/src/config.js`)
const path = require(`path`)
const childProcess = require(`child_process`)
const userHome = require(`user-home`)
const fs = require(`fs-extra`)

async function main() {
  const network = process.argv[2] || config.default_network

  let extendedEnv = {}

  if (network === `local-testnet`) {
    extendedEnv = {
      LCD_URL: `http://localhost:9070`,
      RPC_URL: `http://localhost:26657`
    }
    startLocalNode()
  }

  // run Voyager in a development environment
  let children = await runDev(`./app/networks/${network}/`, extendedEnv)

  // kill all development processes if master process fails
  process.on(`exit`, () => {
    children.forEach(child => child.kill(`SIGKILL`))
  })
  children.forEach(child => child.on(`exit`, () => process.exit()))
}

main().catch(function(err) {
  console.error(`Starting the application failed`, err)
})

async function startLocalNode() {
  const TESTNET_NODE_FOLDER = path.join(userHome, `.gaiad-testnet`)
  const osFolderName = {
    win32: `windows_amd64`,
    darwin: `darwin_amd64`,
    linux: `linux_amd64`
  }[process.platform]
  const gaiadFileName = process.platform === `win32` ? `gaiad.exe` : `gaiad`
  const gaiadPath = path.join(`./builds/Gaia`, osFolderName, gaiadFileName)

  console.log(`Starting local node`)
  let child = childProcess.spawn(gaiadPath, [
    `start`,
    `--home`,
    TESTNET_NODE_FOLDER
  ])

  // log output
  const PROCESS_LOG = path.join(TESTNET_NODE_FOLDER, `process.log`)
  const log = fs.createWriteStream(PROCESS_LOG, { flags: `a` })
  console.log(`Find the node process logs at: ${PROCESS_LOG}`)
  child.stdout.pipe(log)
  child.stderr.pipe(process.stderr)

  // handle node crashed
  child.on(`exit`, () => {
    console.error(`Local node crashed`)
    process.exit()
  })
}
