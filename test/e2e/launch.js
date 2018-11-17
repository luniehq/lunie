"use strict"

let { Application } = require(`spectron`)
let test = require(`tape-promise/tape`)
let electron = require(`electron`)
let { join } = require(`path`)
let { spawn } = require(`child_process`)
let fs = require(`fs-extra`)

const testDir = join(__dirname, `../../testArtifacts`)
let {
  initNode,
  createKey,
  getKeys,
  initGenesis,
  getGenesis,
  startLocalNode,
  makeValidator,
  getNodeId,

  cliBinary,
  nodeBinary,
  defaultStartPort
} = require(`../../tasks/gaia.js`)

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
      console.log(`using cli binary`, cliBinary)
      console.log(`using node binary`, nodeBinary)

      const cliHomePrefix = join(testDir, `cli_home`)
      const nodeHomePrefix = join(testDir, `node_home`)

      fs.removeSync(`testArtifacts`)

      // setup first node
      const nodeOneHome = nodeHomePrefix + `_1`
      const nodeOneCliHome = cliHomePrefix + `_1`
      const operatorKeyName = `testkey`
      console.log(`ui home: ${nodeOneCliHome}`)
      console.log(`node home: ${nodeOneHome}`)

      await initLocalNode(nodeOneHome, 1)
      const nodeOneId = await getNodeId(nodeOneHome)
      reduceTimeouts(nodeOneHome)
      disableStrictAddressbook(nodeOneHome)
      await saveVersion(nodeHomePrefix + `_1`)

      // create address to delegate staking tokens to 2nd and 3rd validator
      let mainAccountSignInfo = {
        keyName: operatorKeyName,
        password: `1234567890`,
        clientHomeDir: nodeOneCliHome
      }
      let { address } = await createKey(mainAccountSignInfo)
      const genesis = await initGenesis(
        mainAccountSignInfo,
        address,
        nodeOneHome
      )

      // wait till the first node produces blocks
      await startLocalNode(nodeOneHome, 1)

      // setup additional nodes
      await initSecondaryLocalNode(`${nodeHomePrefix}_2`, 2, genesis, address)
      await initSecondaryLocalNode(`${nodeHomePrefix}_3`, 3, genesis, address)

      // start secondary nodes and connect to node one
      // wait until all nodes are showing blocks, so we know they are running
      await startLocalNode(`${nodeHomePrefix}_2`, 2, nodeOneId)
      await startLocalNode(`${nodeHomePrefix}_3`, 3, nodeOneId)
      console.log(`Started local nodes.`)

      // make our secondary nodes also to validators
      await makeValidator(
        mainAccountSignInfo,
        `${nodeHomePrefix}_2`,
        `${cliHomePrefix}_2`,
        `local_2`
      )
      await makeValidator(
        mainAccountSignInfo,
        `${nodeHomePrefix}_3`,
        `${cliHomePrefix}_3`,
        `local_3`
      )
      console.log(`Declared secondary nodes to be validators.`)

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
          COSMOS_NETWORK: join(nodeOneHome, `config`),
          COSMOS_MOCKED: false, // the e2e tests expect mocking to be switched off
          BINARY_PATH: cliBinary,
          LCD_URL: `https://localhost:9071`,
          RPC_URL: `http://localhost:${defaultStartPort + 1}`
        }
      })

      await startApp(app)
      await stop(app)

      // setup additional accounts for testing
      let accounts = await setupAccounts(
        nodeOneCliHome,
        join(cliHomePrefix, `lcd`)
      )

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

async function setupAccounts(nodeOneClientDir, voyagerCLIDir) {
  // use the master account that holds funds from node 1
  // to use it, we copy the key database from node one to our Voyager cli config folde
  fs.copySync(nodeOneClientDir, voyagerCLIDir)

  // this account is later used to send funds to, to test token sending
  await createKey({
    keyName: `testreceiver`,
    password: `1234567890`,
    clientHomeDir: voyagerCLIDir
  })

  let accounts = await getKeys(voyagerCLIDir)
  console.log(`setup test accounts`, accounts)

  return accounts
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

async function initLocalNode(nodeHome, number = 1) {
  await initNode(`test_chain`, `local_${number}`, nodeHome, `1234567890`, true)

  return getGenesis(nodeHome)
}

// init a node and define it as a validator
async function initSecondaryLocalNode(nodeHome, number, mainGenesis) {
  await initLocalNode(nodeHome, number)
  fs.writeJSONSync(join(nodeHome, `config/genesis.json`), mainGenesis)
  reduceTimeouts(nodeHome)
  disableStrictAddressbook(nodeHome)
}

// declare candidacy for node

function reduceTimeouts(nodeHome) {
  const configPath = join(nodeHome, `config`, `config.toml`)
  let configToml = fs.readFileSync(configPath, `utf8`)

  const timeouts = [
    `timeout_propose`,
    `timeout_propose_delta`,
    `timeout_prevote`,
    `timeout_prevote_delta`,
    `timeout_precommit`,
    `timeout_precommit_delta`,
    `timeout_commit`,
    `flush_throttle_timeout`
  ]
  const updatedConfigToml = configToml
    .split(`\n`)
    .map(line => {
      let [key, value] = line.split(` = `)

      if (!timeouts.includes(key)) {
        return line
      }

      // timeouts are in the format "100ms" or "5s"
      value = value.replace(/"/g, ``)
      if (value.trim().endsWith(`ms`)) {
        value = parseInt(value.trim().substr(0, value.length - 2))
      } else if (value.trim().endsWith(`s`)) {
        value = parseInt(value.trim().substr(0, value.length - 1)) * 1000
      }

      return `${key} = "${value / 10}ms"`
    })
    .join(`\n`)

  fs.writeFileSync(configPath, updatedConfigToml, `utf8`)
}

function disableStrictAddressbook(nodeHome) {
  const configPath = join(nodeHome, `config`, `config.toml`)
  let configToml = fs.readFileSync(configPath, `utf8`)

  const updatedConfigToml = configToml
    .split(`\n`)
    .map(line => {
      if (line.startsWith(`addr_book_strict`)) return `addr_book_strict = false`
      return line
    })
    .join(`\n`)

  fs.writeFileSync(configPath, updatedConfigToml, `utf8`)
}

// save the version of the currently used gaia into the newly created network config folder
function saveVersion(nodeHome) {
  return new Promise((resolve, reject) => {
    let versionFilePath = join(nodeHome, `config`, `gaiaversion.txt`) // nodeHome/config is used to copy created config files from, therefor we copy the version file in there
    const command = `${nodeBinary} version`
    console.log(command, `>`, versionFilePath)
    let child = spawn(command, { shell: true })
    child.stderr.pipe(process.stderr)
    child.stdout.once(`data`, data => {
      let msg = data.toString()

      if (!msg.includes(`Failed`) && !msg.includes(`Error`)) {
        fs.ensureFileSync(versionFilePath)
        fs.writeFileSync(versionFilePath, msg, `utf8`)
        resolve()
      } else {
        reject(msg)
      }
    })
  })
}

module.exports = {
  getApp: launch,
  restart: async function(app, awaitingSelector = `.tm-session-title=Sign In`) {
    console.log(`restarting app`)
    await stop(app)
    await startApp(app, awaitingSelector)
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
