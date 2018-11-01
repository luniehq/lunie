"use strict"

let runDev = require(`./runner.js`)
let config = require(`../app/src/config.js`)
const path = require(`path`)
const childProcess = require(`child_process`)
const userHome = require(`user-home`)

async function main() {
  const network = process.argv[2] || config.default_network

  if (network === `local-testnet`) {
    Object.assign(process.env, {
      LCD_URL: `http://localhost:9070`,
      RPC_URL: `http://localhost:26657`
    })
    let nodeProcess = startLocalNode()
  }

  // run Voyager in a development environment
  let processes = runDev(`./app/networks/${network}/`)

  // kill all development processes if master process fails
  process.on(`exit`, () => {
    processes.forEach(process => process.send(`SIGKILL`))
  })
}

main().catch(function(err) {
  console.error(`Starting the application failed`, err)
})

async function startLocalNode() {
  const TESTNET_NODE_FOLDER = path.join(userHome, `.gaiad-testnet`)
  const osFolderName = (function() {
    switch (process.platform) {
      case `win32`:
        return `windows_amd64`
      case `darwin`:
        return `darwin_amd64`
      case `linux`:
        return `linux_amd64`
    }
  })()
  const gaiadFileName = process.platform === `win32` ? `gaiad.exe` : `gaiad`
  const gaiadPath = path.join(`./builds/Gaia`, osFolderName, gaiadFileName)

  console.log(`Starting local node`)
  let child = childProcess.spawn(gaiadPath, [
    `start`,
    `--home`,
    TESTNET_NODE_FOLDER
  ])
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
  child.on(`exit`, () => {
    throw Error(`Local node crashed`)
  })
}
