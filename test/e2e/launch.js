"use strict"

let { Application } = require("spectron")
let test = require("tape-promise/tape")
let electron = require("electron")
let { join } = require("path")
let { spawn } = require("child_process")
let fs = require("fs-extra")

const testDir = join(__dirname, "../../testArtifacts")

let app, cliHome, nodeHome, started, crashed
let binary = process.env.BINARY_PATH || process.env.GOPATH + "/bin/gaiacli"
let nodeBinary =
  process.env.NODE_BINARY_PATH || process.env.GOPATH + "/bin/gaiad"

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

      fs.emptyDirSync(cliHome)
      fs.emptyDirSync(nodeHome)

      const initValues = await initLocalNode()
      reduceTimeouts()
      await startLocalNode()
      console.log(`Started local node.`)
      await saveVersion()

      app = new Application({
        path: electron,
        args: [
          join(__dirname, "../../app/dist/main.js"),
          JSON.parse(process.env.CI || "false") ? "--headless" : "",
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
          COSMOS_NETWORK: join(nodeHome, "config"),
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
      if (!imageBuffer.length) {
        console.log("saving screenshot to ", screenshotLocation)
        fs.writeFileSync(screenshotLocation, imageBuffer)
      }
    })
  }

  if (!process.env.COSMOS_E2E_KEEP_OPEN) {
    if (app) await app.stop()

    process.exit(1)
  }
}

function startLocalNode() {
  return new Promise((resolve, reject) => {
    const command = `${nodeBinary} start --home ${nodeHome}`
    console.log(command)
    const localnodeProcess = spawn(command, { shell: true })
    localnodeProcess.stderr.pipe(process.stderr)

    localnodeProcess.stdout.once("data", data => {
      let msg = data.toString()

      if (!msg.includes("Failed") && !msg.includes("Error")) {
        resolve()
      } else {
        reject(msg)
      }
    })

    localnodeProcess.once("exit", reject)
  })
}

function initLocalNode() {
  return new Promise((resolve, reject) => {
    const command = `${nodeBinary} init --home ${nodeHome} --name local --owk`
    console.log(command)
    const localnodeProcess = spawn(command, { shell: true })
    localnodeProcess.stderr.pipe(process.stderr)

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

function reduceTimeouts() {
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

// save the version of the currently used gaia into the newly created network config folder
function saveVersion() {
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
