"use strict"
const fs = require(`fs`)
const config = require(`../app/src/config`)
const spawn = require(`child_process`).spawn
const path = require(`path`)
const { cleanExitChild } = require(`./common.js`)

const YELLOW = `\x1b[33m`
const BLUE = `\x1b[34m`
const END = `\x1b[0m`

const NPM_BIN = path.join(path.dirname(__dirname), `node_modules`, `.bin`)
const PATH = `${NPM_BIN}:${process.env.PATH}`

const format = (command, data, color) =>
  `${color}${command}${END}  ${data
    .toString()
    .trim()
    .replace(/\n/g, `\n${` `.repeat(command.length + 2)}`)}\n`

function run(command, color, name, env) {
  env = Object.assign({ PATH }, env)
  const child = spawn(command, { env, shell: true })
  child.stdout.on(`data`, data => {
    console.log(format(name, data, color))
  })
  child.stderr.on(`data`, data => {
    console.error(format(name, data, color))
  })
  child.on(`exit`, code => {
    console.log(`exited`, command, code)
  })
  return child
}

function startRendererServer() {
  return new Promise(resolve => {
    console.log(`${YELLOW}Starting webpack-dev-server...\n${END}`)
    const child = run(
      `webpack-dev-server --hot --colors --config webpack.renderer.config.js --port ${
        config.wds_port
      } --content-base app/dist`,
      YELLOW,
      `webpack`
    )
    const waitForCompile = data => {
      if (!data.toString().includes(`Compiled`)) return
      child.stdout.removeListener(`data`, waitForCompile)
      resolve(child)
    }
    child.stdout.on(`data`, waitForCompile)
  })
}

module.exports = async function(networkPath, extendedEnv = {}) {
  if (!fs.existsSync(networkPath)) {
    console.error(
      `The network configuration for the network you want to connect to doesn't exist. Have you run \`yarn build:testnets\` to download the latest configurations?`
    )
    process.exit()
  }

  const renderProcess = await startRendererServer()

  console.log(
    `${BLUE}Starting electron...\n  (network path: ${networkPath})\n${END}`
  )
  const packageJSON = require(`../package.json`)
  const voyagerVersion = packageJSON.version
  const gaiaVersion = fs
    .readFileSync(path.join(networkPath, `gaiaversion.txt`))
    .toString()
    .split(`-`)[0]
  const env = Object.assign(
    {},
    {
      NODE_ENV: `development`,
      COSMOS_NETWORK: networkPath,
      GAIA_VERSION: gaiaVersion,
      VOYAGER_VERSION: voyagerVersion
    },
    extendedEnv,
    process.env
  )
  const mainProcess = run(
    `electron app/src/main/index.dev.js`,
    BLUE,
    `electron`,
    env
  )

  // terminate running processes on exit of main process
  mainProcess.on(`exit`, async () => {
    await cleanExitChild(renderProcess)
    // webpack-dev-server spins up an own process we have no access to. so we kill all processes on our port
    process.exit(0)
  })

  return [renderProcess, mainProcess]
}
