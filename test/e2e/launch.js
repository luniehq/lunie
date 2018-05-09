"use strict"

let { Application } = require("spectron")
let test = require("tape-promise/tape")
let electron = require("electron")
let { join } = require("path")
let { spawn } = require("child_process")
let fs = require("fs-extra")
let { newTempDir, login } = require("./common.js")
const shell = require(`shelljs`)

let app, home, cliHome, started
let binary = process.env.BINARY_PATH
let nodeBinary = process.env.NODE_BINARY_PATH

/*
* NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
*/

function launch(t) {
  if (!started) {
    // tape doesn't exit properly on uncaught promise rejections
    if (!process.env.COSMOS_E2E_KEEP_OPEN)
      process.on("unhandledRejection", async error => {
        try {
          console.error("unhandledRejection", error)
          if (app && app.client) {
            console.log(
              "saving screenshot to ",
              join(__dirname, "snapshot.png")
            )
            await app.browserWindow.capturePage().then(function(imageBuffer) {
              fs.writeFileSync(join(__dirname, "snapshot.png"), imageBuffer)
            })
            await printAppLog(app)
          }
        } catch (err) {
          console.error(err)
        }
        process.exit(1)
      })

    started = new Promise(async (resolve, reject) => {
      console.log("using binary", binary)

      // TODO cleanup
      home = newTempDir()
      cliHome = join(newTempDir(), "lcd")
      console.error(`ui home: ${home}`)
      console.error(`node home: ${cliHome}`)

      await startLocalNode()

      app = new Application({
        path: electron,
        args: [
          join(__dirname, "../../app/dist/main.js"),
          process.env.COSMOS_E2E_KEEP_OPEN ? "" : "--headless",
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
          COSMOS_HOME: home,
          COSMOS_NETWORK: "test/e2e/localtestnet"
        }
      })

      await startApp(app, ".ni-modal-lcd-approval")
      t.ok(app.isRunning(), "app is running")

      // accept node hash
      await app.client.$("#ni-modal-lcd-approval__btn-approve").click()
      await app.client.waitForExist(
        ".ni-session-title=Sign in to Cosmos Voyager",
        5000
      )

      // test if app restores from unitialized gaia folder
      await stop(app)
      fs.removeSync(join(home, "lcd"))
      fs.mkdirpSync(join(home, "lcd"))
      await startApp(app, ".ni-modal-lcd-approval")
      t.ok(app.isRunning(), "app recovers from uninitialized gaia")

      // accept node hash
      await app.client.$("#ni-modal-lcd-approval__btn-approve").click()
      await app.client.waitForExist(
        ".ni-session-title=Sign in to Cosmos Voyager",
        5000
      )
      console.log("approved hash")

      await stop(app)
      await createAccount(
        "testkey",
        "chair govern physical divorce tape movie slam field gloom process pen universe allow pyramid private ability"
      )
      await createAccount(
        "testreceiver",
        "crash ten rug mosquito cart south allow pluck shine island broom deputy hungry photo drift absorb"
      )
      console.log("setup test accounts")
      await startApp(app, ".ni-session-title=Sign In")

      t.ok(app.isRunning(), "app is running")

      resolve({ app, home })
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
  await app.stop()
}

async function printAppLog(app) {
  await app.client.getMainProcessLogs().then(function(logs) {
    logs.forEach(function(log) {
      console.log(log)
    })
  })
  await app.client.getRenderProcessLogs().then(function(logs) {
    logs.forEach(function(log) {
      console.log(log.message)
      console.log(log.source)
      console.log(log.level)
    })
  })
}

async function startApp(app, awaitingSelector = ".ni-session") {
  await app.start()

  await app.client.waitForExist(awaitingSelector, 10 * 1000).catch(async e => {
    await printAppLog(app)
    throw e
  })
}

async function startLocalNode() {
  const command = `${nodeBinary} init \
D0718DDFF62D301626B428A182F830CBB0AD21FC --home ${cliHome}`

  console.log(command)
  shell.exec(command)
  console.log(`Initialized local node.`)

  await new Promise((resolve, reject) => {
    // TODO cleanup
    const command = `${nodeBinary} start --home ${cliHome}`
    console.log(command)
    let localnodeProcess = shell.exec(command, { async: true, silent: true })
    localnodeProcess.stderr.pipe(process.stderr)

    localnodeProcess.stdout.once("data", data => {
      let msg = data.toString()
      if (!msg.includes("Failed") && !msg.includes("Error")) {
        resolve()
      }
      reject()
    })

    localnodeProcess.once("exit", code => {
      reject()
    })
  })

  console.log(`Started local node.`)
}

async function createAccount(name, seed) {
  await new Promise((resolve, reject) => {
    let child = spawn(binary, [
      "keys",
      "recover",
      name,
      "--home",
      join(home, "lcd")
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
