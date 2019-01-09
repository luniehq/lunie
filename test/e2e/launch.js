"use strict"

let { Application } = require(`spectron`)
let test = require(`tape-promise/tape`)
let electron = require(`electron`)
let { join } = require(`path`)
let fs = require(`fs-extra`)
const {
  setupAccounts,
  buildNodes,
  startNodes
} = require(`../../tasks/build/local/helper`)
let { cliBinary, nodeBinary, defaultStartPort } = require(`../../tasks/gaia.js`)

const testDir = join(__dirname, `..`, `..`, `testArtifacts`)
let app, started, crashed

/*
 * NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
 */

function launch(t) {
  if (!started) {
    // tape doesn't exit properly on uncaught promise rejections
    process.on(`unhandledRejection`, async error => {
      return handleCrash(app, error)
    })

    started = new Promise(async resolve => {
      const { cliHomePrefix, cliHome, home } = await bootLocalNetwork(testDir, {
        chainId: `test_chain`,
        password: `1234567890`,
        overwrite: true,
        moniker: `local`,
        keyName: `testkey`
      })

      app = new Application({
        path: electron,
        args: [
          join(__dirname, `../../app/dist/main.js`),
          `--disable-gpu`,
          `--no-sandbox`
        ],
        startTimeout: 10000,
        waitTimeout: 10000,
        env: {
          COSMOS_NODE: `localhost`,
          NODE_ENV: `production`,
          PREVIEW: `true`,
          COSMOS_DEVTOOLS: 0, // open devtools will cause issues with spectron, you can open them later manually
          COSMOS_HOME: cliHomePrefix,
          COSMOS_NETWORK: join(home, `config`),
          COSMOS_MOCKED: false, // the e2e tests expect mocking to be switched off
          BINARY_PATH: cliBinary,
          LCD_URL: `https://localhost:9071`,
          RPC_URL: `http://localhost:${defaultStartPort + 1}`
        }
      })

      await startApp(app)
      await stop(app)

      // setup additional accounts for testing
      let accounts = await setupAccounts(cliHome, join(cliHomePrefix, `lcd`))

      await startApp(app, `.tm-session-title=Sign In`)
      t.ok(app.isRunning(), `app is running`)

      // disable the onboarding wizard
      await app.client.localStorage(`POST`, {
        key: `appOnboardingActive`,
        value: `false`
      })

      resolve({
        app,
        cliHome: cliHomePrefix, // the Voyager instance will have another folder outside of the nodes config folders
        accounts
      })
    })
  }

  return started
}

test.onFinish(async () => {
  console.log(`DONE: cleaning up`)
  await stop(app)
  // tape doesn't finish properly because of open processes like gaia
  process.exit(0)
})

const bootLocalNetwork = async (targetDir, options) => {
  console.log(`using cli binary`, cliBinary)
  console.log(`using node binary`, nodeBinary)

  const { nodes, cliHomePrefix, mainAccountSignInfo } = await buildNodes(
    targetDir,
    options,
    3,
    true
  )

  console.log(`Done with initialization, start the nodes`)

  await startNodes(nodes, mainAccountSignInfo, options.chainId)

  console.log(`Declared secondary nodes to be validators.`)

  return {
    cliHomePrefix,
    ...nodes[1]
  }
}

async function stop(app) {
  console.log(`Stopping app`)
  if (app && app.isRunning()) {
    if (process.env.CI) {
      // we need to collect the app process output as it will be reset when the app is stopped
      console.log(`collecting app logs`)
      await writeLogs(app, testDir)
    }
    await app.stop()
  }
  console.log(`App stopped`)
}

async function printAppLog(app) {
  if (!app) {
    console.log(`Not printing logs as app has not started yet`)
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
      console.log(log.message.replace(`\\n`, `\n`))
    })
  })
}

async function writeLogs(app, location) {
  const mainProcessLogLocation = join(location, `main-process.log`)
  const rendererProcessLogLocation = join(location, `renderer-process.log`)
  fs.ensureFileSync(mainProcessLogLocation)
  fs.ensureFileSync(rendererProcessLogLocation)

  const mainProcessLogs = (await app.client.getMainProcessLogs()).filter(
    log => !/CONSOLE\(/g.test(log)
  ) // ignore renderer process output, which is also written to main process logs
  const rendererProcessLogs = await app.client.getRenderProcessLogs()
  fs.appendFileSync(mainProcessLogLocation, mainProcessLogs.join(`\n`), `utf8`)
  fs.appendFileSync(
    rendererProcessLogLocation,
    rendererProcessLogs.map(log => log.message).join(`\n`),
    `utf8`
  )
  console.log(`Wrote main process log to`, mainProcessLogLocation)
  console.log(`Wrote renderer process log to`, rendererProcessLogLocation)
}

async function startApp(app, awaitingSelector = `.tm-session`) {
  console.log(`Starting app`)
  await app.start()
  if (!app.browserWindow) {
    console.log(`No browser window`)
    return
  }
  app.browserWindow.setBounds({ x: 0, y: 0, width: 1600, height: 1024 })
  app.browserWindow.setSize(1600, 1024)

  await app.client.waitForExist(awaitingSelector, 10 * 1000).catch(async e => {
    await handleCrash(app, e)
    throw e
  })
  console.log(`Started app`)
}

async function handleCrash(app, error) {
  // only write logs once even if writing them fails to not recursively call this function
  if (crashed) {
    return
  }
  crashed = true

  console.error(`-- App crashed --`)
  console.error(error)

  // show or persist logs
  if (process.env.CI) {
    await writeLogs(app, testDir)
  } else {
    await printAppLog(app)
  }

  // save a screenshot
  if (app && app.browserWindow) {
    const screenshotLocation = join(testDir, `snapshot.png`)
    await app.browserWindow.capturePage().then(function(imageBuffer) {
      console.log(`saving screenshot to `, screenshotLocation)
      fs.writeFileSync(screenshotLocation, imageBuffer)
    })
  }

  if (!process.env.COSMOS_E2E_KEEP_OPEN) {
    if (app) await app.stop()

    process.exit(1)
  }
}

module.exports = {
  getApp: launch,
  restart: async function(app, awaitingSelector = `.tm-session-title=Sign In`) {
    console.log(`restarting app`)
    await stop(app)
    await startApp(app, awaitingSelector)
    app.browserWindow.setBounds({ x: 0, y: 0, width: 1600, height: 1024 })
    app.browserWindow.setSize(1600, 1024)
  },
  refresh: async function(app, awaitingSelector = `.tm-session-title=Sign In`) {
    console.log(`refreshing app`)
    if (app && app.isRunning()) {
      if (process.env.CI) {
        // we need to collect the app process output as it will be reset when the app is stopped
        console.log(`collecting app logs`)
        await writeLogs(app, testDir)
      }
    }
    await app.restart()
    await app.client.waitForExist(awaitingSelector, 5000)
  },
  startApp,
  stop
}
