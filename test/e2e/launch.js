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
      console.error("unhandledRejection", error)
      return handleCrash(app)
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
      let genesis = fs.readJSONSync(
        join(nodeHome + "_1", "config/genesis.json")
      )
      addValidator(genesis, nodeTwoPubKey)
      updateGenesis(genesis, nodeHome + "_1")
      updateGenesis(genesis, nodeHome + "_2")
      reduceTimeouts(nodeHome + "_1")
      reduceTimeouts(nodeHome + "_2")
      disableStrictAddressbook(nodeHome + "_1")
      disableStrictAddressbook(nodeHome + "_2")

      await startLocalNode()
      console.log(`Started local node.`)
      await startLocalNode(2, nodeOneId)
      console.log(`Started local node 2.`)
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

      // TODO: use approval element once we restore initting
      //       (".tm-modal-lcd-approval")
      let initialElement = ".tm-session-wrapper"
      await startApp(app, initialElement)
      t.ok(app.isRunning(), "app is running")

      // TODO: uncomment below once we restore initting

      // accept node hash
      // await app.client.$("#tm-modal-lcd-approval__btn-approve").click()
      // await app.client.waitForExist(
      //   ".tm-session-title=Sign in to Cosmos Voyager",
      //   5000
      // )

      // test if app restores from unitialized gaia folder
      await stop(app)
      fs.removeSync(cliHome)
      await startApp(app, initialElement)
      t.ok(app.isRunning(), "app recovers from uninitialized gaia")

      // accept node hash
      // await app.client.$("#tm-modal-lcd-approval__btn-approve").click()
      // await app.client.waitForExist(
      //   ".tm-session-title=Sign in to Cosmos Voyager",
      //   5000
      // )
      // console.log("approved hash")

      await stop(app)
      let accounts = []
      // testkey account needs to match genesis to own tokens for testing
      accounts.push(
        await createAccount("testkey", initValues.app_message.secret)
      )
      accounts.push(await createAccount("testreceiver"))
      console.log("setup test accounts", accounts)

      await startApp(app, ".tm-session-title=Sign In")
      t.ok(app.isRunning(), "app is running")

      // disable the onboarding wizard
      await app.client.localStorage("POST", {
        key: "appOnboardingActive",
        value: "false"
      })

      resolve({ app, cliHome, accounts })
    })
  }

  return started
}

test.onFinish(async () => {
  console.log("DONE: cleaning up")
  if (app) await app.stop()
  // tape doesn't finish properly because of open processes like gaia
  process.exit(0)
})

async function stop(app) {
  console.log("Stopping app")
  await app.stop()
  console.log("App stopped")
}

async function printAppLog(app) {
  if (!app) {
    console.log("Not printing logs as app has not started yet")
    return
  }

  await app.client.getMainProcessLogs().then(function(logs) {
    logs.forEach(function(log) {
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

  const mainProcessLogs = await app.client.getMainProcessLogs()
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
  await app.start()

  await app.client.waitForExist(awaitingSelector, 10 * 1000).catch(async e => {
    await handleCrash(app)
    throw e
  })
}

async function handleCrash(app) {
  // only write logs once even if writing them fails to not recursively call this function
  if (crashed) {
    return
  }
  crashed = true

  // show or persist logs
  if (process.env.CI) {
    await writeLogs(app, testDir)
  } else {
    await printAppLog(app)
  }

  // save a screenshot
  if (process.env.CI && app && app.browserWindow) {
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
        2} --p2p.persistent_peers="${nodeOneId}@localhost:${defaultStartPort +
        1}"`
    }
    console.log(command)
    const localnodeProcess = spawn(command, { shell: true })
    if (number > 1) localnodeProcess.stdout.pipe(process.stdout)
    localnodeProcess.stderr.pipe(process.stderr)

    function listener(data) {
      let msg = data.toString()

      console.log(msg)
      if (msg.includes("Block{")) {
        localnodeProcess.stdout.removeListener("data", listener)
        resolve()
      }

      // if (msg.includes("Failed") || msg.includes("Error")) {
      //   reject(msg)
      // }
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

function addValidator(genesis, pub_key) {
  genesis.validators.push({
    pub_key,
    power: "50",
    name: ""
  })
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
  }
}
