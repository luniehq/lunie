"use strict"

let { Application } = require("spectron")
let test = require("tape-promise/tape")
let electron = require("electron")
let { join } = require("path")
let { spawn } = require("child_process")
const util = require("util")
const exec = util.promisify(require("child_process").exec)
let fs = require("fs-extra")

const testDir = join(__dirname, "../../testArtifacts")

let app, cliHome, nodeHome, started, crashed

const osFolderName = (function() {
  switch (process.platform) {
    case "win32":
      return "windows_amd64"
    case "darwin":
      return "darwin_amd64"
    case "linux":
      return "linux_amd64"
  }
})()
let binary =
  process.env.BINARY_PATH ||
  join(__dirname, "../../builds/Gaia/", osFolderName, "gaiacli")

let nodeBinary =
  process.env.NODE_BINARY_PATH ||
  join(__dirname, "../../builds/Gaia/", osFolderName, "gaiad")

/*
* NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
*/

function launch(t) {
  if (!started) {
    // tape doesn't exit properly on uncaught promise rejections
    process.on("unhandledRejection", async error => {
      return handleCrash(app, error)
    })

    started = new Promise(async resolve => {
      console.log("using cli binary", binary)
      console.log("using node binary", nodeBinary)

      cliHome = join(testDir, "cli_home")
      nodeHome = join(testDir, "node_home")
      console.error(`ui home: ${cliHome}`)
      console.error(`node home: ${nodeHome}`)

      fs.removeSync("testArtifacts")

      const initValues = await initLocalNode(1)
      const nodeOneId = await getNodeId(nodeHome + "_1")
      await initLocalNode(2)
      const nodeTwoPubKey = getValidatorPublicKey(nodeHome + "_2")
      const nodeTwoOwner = getValidatorOwner(nodeHome + "_2")
      let genesis = fs.readJSONSync(
        join(nodeHome + "_1", "config/genesis.json")
      )
      addValidator(genesis, nodeTwoPubKey, nodeTwoOwner, 2)
      updateGenesis(genesis, nodeHome + "_1")
      updateGenesis(genesis, nodeHome + "_2")
      reduceTimeouts(nodeHome + "_1")
      reduceTimeouts(nodeHome + "_2")
      disableStrictAddressbook(nodeHome + "_1")
      disableStrictAddressbook(nodeHome + "_2")

      await Promise.all([startLocalNode(), startLocalNode(2, nodeOneId)])
      console.log(`Started local nodes.`)
      await saveVersion(nodeHome + "_1")

      app = new Application({
        path: electron,
        args: [
          join(__dirname, "../../app/dist/main.js"),
          "--disable-gpu",
          "--no-sandbox"
        ],
        startTimeout: 10000,
        waitTimeout: 10000,
        env: {
          COSMOS_NODE: "localhost",
          NODE_ENV: "production",
          PREVIEW: "true",
          COSMOS_DEVTOOLS: 0, // open devtools will cause issues with spectron, you can open them later manually
          COSMOS_HOME: cliHome,
          COSMOS_NETWORK: join(nodeHome + "_1", "config"),
          COSMOS_MOCKED: false, // the e2e tests expect mocking to be switched off
          BINARY_PATH: binary
        }
      })

      await startApp(app)
      await stop(app)

      let accounts = await setupAccounts(initValues)

      await startApp(app, ".tm-session-title=Sign In")
      t.ok(app.isRunning(), "app is running")

      // disable the onboarding wizard
      await app.client.localStorage("POST", {
        key: "appOnboardingActive",
        value: "false"
      })

      resolve({
        app,
        cliHome,
        accounts
      })
    })
  }

  return started
}

test.onFinish(async () => {
  console.log("DONE: cleaning up")
  await stop(app)
  // tape doesn't finish properly because of open processes like gaia
  process.exit(0)
})

async function setupAccounts(initValues) {
  let accounts = []
  // testkey account needs to match genesis to own tokens for testing
  accounts.push(await createAccount("testkey", initValues.app_message.secret))
  accounts.push(await createAccount("testreceiver"))
  console.log("setup test accounts", accounts)

  return accounts
}

async function stop(app) {
  console.log("Stopping app")
  if (app && app.isRunning()) await app.stop()
  console.log("App stopped")
}

async function printAppLog(app) {
  if (!app) {
    console.log("Not printing logs as app has not started yet")
    return
  }

  await app.client.getMainProcessLogs().then(function(logs) {
    logs
      .filter(line => !/CONSOLE\(/g.test(line)) // ignore renderer process output, which is also written to main process logs
      .forEach(function(log) {
        console.log(log)
      })
  })
  await app.client.getRenderProcessLogs().then(function(logs) {
    logs.forEach(function(log) {
      console.log(log.message.replace("\\n", "\n"))
    })
  })
}

async function writeLogs(app, location) {
  const mainProcessLogLocation = join(location, "main-process.log")
  const rendererProcessLogLocation = join(location, "renderer-process.log")
  fs.ensureFileSync(mainProcessLogLocation)
  fs.ensureFileSync(rendererProcessLogLocation)

  const mainProcessLogs = (await app.client.getMainProcessLogs()).filter(
    log => !/CONSOLE\(/g.test(log)
  ) // ignore renderer process output, which is also written to main process logs
  const rendererProcessLogs = await app.client.getRenderProcessLogs()
  fs.writeFileSync(mainProcessLogLocation, mainProcessLogs.join("\n"), "utf8")
  fs.writeFileSync(
    rendererProcessLogLocation,
    rendererProcessLogs.map(log => log.message).join("\n"),
    "utf8"
  )
  console.log("Wrote main process log to", mainProcessLogLocation)
  console.log("Wrote renderer process log to", rendererProcessLogLocation)
}

async function startApp(app, awaitingSelector = ".tm-session") {
  console.log("Starting app")
  await app.start()

  await app.client.waitForExist(awaitingSelector, 10 * 1000).catch(async e => {
    await handleCrash(app, e)
    throw e
  })
  console.log("Started app")
}

async function handleCrash(app, error) {
  // only write logs once even if writing them fails to not recursively call this function
  if (crashed) {
    return
  }
  crashed = true

  console.error("-- App crashed --")
  console.error(error)

  // show or persist logs
  if (process.env.CI) {
    await writeLogs(app, testDir)
  } else {
    await printAppLog(app)
  }

  // save a screenshot
  if (app && app.browserWindow) {
    const screenshotLocation = join(testDir, "snapshot.png")
    await app.browserWindow.capturePage().then(function(imageBuffer) {
      console.log("saving screenshot to ", screenshotLocation)
      fs.writeFileSync(screenshotLocation, imageBuffer)
    })
  }

  if (!process.env.COSMOS_E2E_KEEP_OPEN) {
    if (app) await app.stop()

    process.exit(1)
  }
}

function startLocalNode(number = 1, nodeOneId = "") {
  return new Promise((resolve, reject) => {
    const defaultStartPort = 26656
    let command = `${nodeBinary} start --home ${nodeHome}_${number}`
    if (number > 1) {
      command += ` --p2p.laddr=tcp://0.0.0.0:${defaultStartPort -
        (number - 1) * 3} --address=tcp://0.0.0.0:${defaultStartPort -
        (number - 1) * 3 +
        1} --rpc.laddr=tcp://0.0.0.0:${defaultStartPort -
        (number - 1) * 3 +
        2} --p2p.persistent_peers="${nodeOneId}@localhost:${defaultStartPort}"`
    }
    console.log(command)
    const localnodeProcess = spawn(command, { shell: true })
    localnodeProcess.stderr.pipe(process.stderr)

    function listener(data) {
      let msg = data.toString()

      console.log("NODE_" + number + "\n" + msg)
      if (msg.includes("Block{")) {
        localnodeProcess.stdout.removeListener("data", listener)
        resolve()
      }

      if (msg.includes("Failed") || msg.includes("Error")) {
        reject(msg)
      }
    }
    localnodeProcess.stdout.on("data", listener)

    localnodeProcess.once("exit", reject)
  })
}

function initLocalNode(number = 1) {
  return new Promise((resolve, reject) => {
    const command = `${nodeBinary} init --home ${nodeHome}_${number} --chain-id=test_chain --name local_${number} --owk --overwrite`
    console.log(command)
    const localnodeProcess = spawn(command, { shell: true })
    localnodeProcess.stderr.pipe(process.stderr)

    localnodeProcess.stdin.write("12345678\n")

    localnodeProcess.stdout.once("data", data => {
      let msg = data.toString()

      if (!msg.includes("Failed") && !msg.includes("Error")) {
        resolve(JSON.parse(msg))
      } else {
        reject(msg)
      }
    })

    localnodeProcess.once("exit", reject)
  })
}

async function getNodeId(node_home) {
  let command = `${nodeBinary} tendermint show_node_id --home ${node_home}`
  console.log(command)
  const { stdout } = await exec(command)
  return stdout.trim()
}

function getValidatorPublicKey(node_home) {
  let privValidatorKeys = fs.readJSONSync(
    join(node_home, "config/priv_validator.json")
  )
  return privValidatorKeys.pub_key
}

function getValidatorOwner(node_home) {
  let genesis = fs.readJSONSync(join(node_home, "config/genesis.json"))

  return genesis.app_state.stake.validators[0].owner
}

function addValidator(genesis, pub_key, owner, number) {
  genesis.validators.push({
    pub_key,
    power: "50",
    name: ""
  })
  let newStakeValidator = JSON.parse(
    JSON.stringify(genesis.app_state.stake.validators[0])
  )
  newStakeValidator.pub_key = pub_key
  newStakeValidator.owner = owner
  newStakeValidator.tokens = "50"
  newStakeValidator.delegator_shares = "50"
  newStakeValidator.description.moniker = "local_" + number
  genesis.app_state.stake.validators.push(newStakeValidator)
  genesis.app_state.stake.pool.loose_tokens += 50
}

function updateGenesis(genesis, node_home) {
  fs.writeJSONSync(join(node_home, "config/genesis.json"), genesis)
}

function reduceTimeouts(nodeHome) {
  const configPath = join(nodeHome, "config", "config.toml")
  let configToml = fs.readFileSync(configPath, "utf8")

  const timeouts = [
    "timeout_propose",
    "timeout_propose_delta",
    "timeout_prevote",
    "timeout_prevote_delta",
    "timeout_precommit",
    "timeout_precommit_delta",
    "timeout_commit",
    "flush_throttle_timeout"
  ]
  const updatedConfigToml = configToml
    .split("\n")
    .map(line => {
      let [key, value] = line.split(" = ")
      if (timeouts.indexOf(key) !== -1) {
        return `${key} = ${parseInt(value) / 50}`
      }
      return line
    })
    .join("\n")

  fs.writeFileSync(configPath, updatedConfigToml, "utf8")
}

function disableStrictAddressbook(nodeHome) {
  const configPath = join(nodeHome, "config", "config.toml")
  let configToml = fs.readFileSync(configPath, "utf8")

  const updatedConfigToml = configToml
    .split("\n")
    .map(line => {
      if (line.startsWith("addr_book_strict")) return "addr_book_strict = false"
      return line
    })
    .join("\n")

  fs.writeFileSync(configPath, updatedConfigToml, "utf8")
}

// save the version of the currently used gaia into the newly created network config folder
function saveVersion(nodeHome) {
  return new Promise((resolve, reject) => {
    let versionFilePath = join(nodeHome, "config", "gaiaversion.txt") // nodeHome/config is used to copy created config files from, therefor we copy the version file in there
    const command = `${nodeBinary} version`
    console.log(command, ">", versionFilePath)
    let child = spawn(command, { shell: true })
    child.stderr.pipe(process.stderr)
    child.stdout.once("data", data => {
      let msg = data.toString()

      if (!msg.includes("Failed") && !msg.includes("Error")) {
        fs.ensureFileSync(versionFilePath)
        fs.writeFileSync(versionFilePath, msg, "utf8")
        resolve()
      } else {
        reject(msg)
      }
    })
  })
}

function createAccount(name, seed) {
  return new Promise((resolve, reject) => {
    let child = spawn(
      binary,
      [
        "keys",
        "add",
        name,
        seed ? "--recover" : null,
        "--home",
        join(cliHome, "lcd"),
        "--output",
        "json"
      ].filter(x => x !== null)
    )

    child.stdout.once("data", data => {
      let msg = data.toString()

      if (msg.startsWith("{")) {
        resolve(JSON.parse(msg))
      }
    })

    child.stdin.write("1234567890\n")
    seed && child.stdin.write(seed + "\n")
    child.stderr.pipe(process.stdout)
    child.once("exit", code => {
      if (code !== 0) reject()
    })
  })
}

module.exports = {
  getApp: launch,
  restart: async function(app, awaitingSelector = ".tm-session-title=Sign In") {
    console.log("restarting app")
    await stop(app)
    await startApp(app, awaitingSelector)
  },
  refresh: async function(app, awaitingSelector = ".tm-session-title=Sign In") {
    console.log("refreshing app")
    await app.restart()
    await app.client.waitForExist(awaitingSelector, 5000)
  },
  startApp,
  stop
}
