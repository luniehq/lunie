"use strict"

let { Application } = require("spectron")
let test = require("tape-promise/tape")
let electron = require("electron")
let { join } = require("path")
let { spawn } = require("child_process")
let fs = require("fs-extra")
let { login } = require("./common.js")

const networkPath = join(__dirname, "localtestnet")
const test_dir = join(__dirname, "../../test_temp")

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
      await handleCrash(app)
    })

    started = new Promise(async (resolve, reject) => {
      console.log("using cli binary", binary)
      console.log("using node binary", nodeBinary)

      cliHome = join(test_dir, "cli_home")
      nodeHome = join(test_dir, "node_home")
      console.error(`ui home: ${cliHome}`)
      console.error(`node home: ${nodeHome}`)

      fs.emptyDirSync(cliHome)
      fs.emptyDirSync(nodeHome)

      await startLocalNode()
      console.log(`Started local node.`)

      app = new Application({
        path: electron,
        args: [
          join(__dirname, "../../app/dist/main.js"),
          !JSON.parse(process.env.CI || "false") ? "" : "--headless",
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
          COSMOS_NETWORK: networkPath,
          COSMOS_MOCKED: false, // the e2e tests expect mocking to be switched off
          BINARY_PATH: binary
        }
      })

      // TODO: use approval element once we restore initting
      //       (".ni-modal-lcd-approval")
      let initialElement = ".ni-session-wrapper"
      await startApp(app, initialElement)
      t.ok(app.isRunning(), "app is running")

      // TODO: uncomment below once we restore initting

      // accept node hash
      // await app.client.$("#ni-modal-lcd-approval__btn-approve").click()
      // await app.client.waitForExist(
      //   ".ni-session-title=Sign in to Cosmos Voyager",
      //   5000
      // )

      // test if app restores from unitialized gaia folder
      await stop(app)
      fs.removeSync(cliHome)
      await startApp(app, initialElement)
      t.ok(app.isRunning(), "app recovers from uninitialized gaia")

      // accept node hash
      // await app.client.$("#ni-modal-lcd-approval__btn-approve").click()
      // await app.client.waitForExist(
      //   ".ni-session-title=Sign in to Cosmos Voyager",
      //   5000
      // )
      // console.log("approved hash")

      await stop(app)
      await createAccount(
        "testkey",
        // address: DFA5D5AFFC5153FB0E82463FA496A133F949210D
        "senior toy try above unfair silly believe bachelor unfold orient glove isolate hazard capital announce abandon"
      )
      await createAccount(
        "testreceiver",
        // address: 30E64F9A3FA6C2B9864DADDEDA29CB667BF8366C
        "cream another bring skill effort narrow crumble ball trouble verify mother confirm recall rain armor abandon"
      )
      console.log("setup test accounts")

      await startApp(app, ".ni-session-title=Sign In")
      t.ok(app.isRunning(), "app is running")

      // disable the onboarding wizard
      await app.client.localStorage("POST", {
        key: "appOnboardingActive",
        value: "false"
      })

      resolve({ app, cliHome })
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

  let mainProcessLogs = await app.client.getMainProcessLogs()
  let rendererProcessLogs = await app.client.getRenderProcessLogs()
  fs.writeFileSync(mainProcessLogLocation, mainProcessLogs.join("\n"), "utf8")
  fs.writeFileSync(
    rendererProcessLogLocation,
    rendererProcessLogs.map(log => log.message).join("\n"),
    "utf8"
  )
  console.log("Wrote main process log to", mainProcessLogLocation)
  console.log("Wrote renderer process log to", rendererProcessLogLocation)
}

async function startApp(app, awaitingSelector = ".ni-session") {
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
    await writeLogs(app, test_dir)
  } else {
    await printAppLog(app)
  }

  // save a screenshot
  if (process.env.CI && app && app.client) {
    const screenshotLocation = join(test_dir, "snapshot.png")
    await app.browserWindow.capturePage().then(function(imageBuffer) {
      if (!imageBuffer.length) {
        console.log("saving screenshot to ", screenshotLocation)
        fs.writeFileSync(screenshotLocation, imageBuffer)
      }
    })
  }

  if (app) await app.stop()

  if (!process.COSMOS_E2E_KEEP_OPEN) {
    process.exit(1)
  }
}

function startLocalNode() {
  const configPath = join(nodeHome, "config")
  fs.mkdirpSync(configPath)
  fs.copySync(networkPath, configPath)

  return new Promise((resolve, reject) => {
    // TODO cleanup
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

async function createAccount(name, seed) {
  await new Promise((resolve, reject) => {
    let child = spawn(binary, [
      "keys",
      "add",
      "--recover",
      name,
      "--home",
      join(cliHome, "lcd")
    ])
    child.stdin.write("1234567890\n")
    child.stdin.write(seed + "\n")
    child.stderr.pipe(process.stdout)
    child.once("exit", code => {
      if (code === 0) resolve()
      reject()
    })
  })
}

module.exports = {
  getApp: launch,
  restart: async function(app, awaitingSelector = ".ni-session-title=Sign In") {
    console.log("restarting app")
    await stop(app)
    await startApp(app, awaitingSelector)
  },
  refresh: async function(app, awaitingSelector = ".ni-session-title=Sign In") {
    console.log("refreshing app")
    await app.restart()
    await app.client.waitForExist(awaitingSelector, 5000)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
