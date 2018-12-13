"use strict"

const assert = require(`assert`)
let { app, BrowserWindow, ipcMain } = require(`electron`)
let fs = require(`fs-extra`)
const https = require(`https`)
let { join, relative } = require(`path`)
let childProcess = require(`child_process`)
let semver = require(`semver`)
const Sentry = require(`@sentry/node`)
const readline = require(`readline`)
let axios = require(`axios`)

let { version: pkgVersion } = require(`../../../package.json`)
let addMenu = require(`./menu.js`)
let config = require(`../config.js`)
config.node_lcd = process.env.LCD_URL || config.node_lcd
config.node_rpc = process.env.RPC_URL || config.node_rpc
let LcdClient = require(`../renderer/connectors/lcdClient.js`)
global.config = config // to make the config accessable from renderer
global.config.version = pkgVersion

require(`electron-debug`)()

let shuttingDown = false
let mainWindow
let gaiaLiteProcess
let streams = []
let connecting = true
let chainId
let booted = false
let expectedGaiaCliVersion

const root = require(`../root.js`)
global.root = root // to make the root accessable from renderer
const networkPath = require(`../network.js`).path

const lcdHome = join(root, `lcd`)
const WIN = /^win/.test(process.platform)
const DEV = process.env.NODE_ENV === `development`
const TEST = process.env.NODE_ENV === `testing`
global.config.development = DEV || TEST
// TODO default logging or default disable logging?
const LOGGING = JSON.parse(process.env.LOGGING || `true`) !== false
const winURL = DEV
  ? `http://localhost:${config.wds_port}`
  : `file://${__dirname}/index.html`
const LCD_PORT = DEV ? config.lcd_port : config.lcd_port_prod
const MOCK =
  process.env.COSMOS_MOCKED !== undefined
    ? JSON.parse(process.env.COSMOS_MOCKED)
    : false
global.config.mocked = MOCK // persist resolved mock setting also in config used by view thread
const gaiaVersion = fs
  .readFileSync(networkPath + `/gaiaversion.txt`)
  .toString()
  .split(`-`)[0]
process.env.GAIA_VERSION = gaiaVersion

let LCD_BINARY_NAME = `gaiacli` + (WIN ? `.exe` : ``)

function log(...args) {
  if (LOGGING) {
    console.log(...args)
  }
}
function logError(...args) {
  if (LOGGING) {
    console.log(...args)
  }
}

function logProcess(process, logPath) {
  fs.ensureFileSync(logPath)
  // Writestreams are blocking fs cleanup in tests, if you get errors, disable logging
  if (LOGGING) {
    let logStream = fs.createWriteStream(logPath, { flags: `a` }) // 'a' means appending (old data will be preserved)
    streams.push(logStream)
    process.stdout.pipe(logStream)
    process.stderr.pipe(logStream)
  }
}

function handleCrash(error) {
  afterBooted(() => {
    if (mainWindow) {
      mainWindow.webContents.send(`error`, {
        message: error
          ? error.message
            ? error.message
            : error
          : `An unspecified error occurred`
      })
    }
  })
}

async function shutdown() {
  if (shuttingDown) return

  mainWindow = null
  shuttingDown = true

  if (gaiaLiteProcess) {
    await stopLCD()
  }

  return Promise.all(
    streams.map(stream => new Promise(resolve => stream.close(resolve)))
  ).then(() => {
    log(`[SHUTDOWN] Voyager has shutdown`)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 320,
    minHeight: 480,
    width: 1024,
    height: 768,
    center: true,
    title: `Cosmos Voyager`,
    darkTheme: true,
    titleBarStyle: `hidden`,
    backgroundColor: `#15182d`,
    webPreferences: { webSecurity: false }
  })
  mainWindow.once(`ready-to-show`, () => {
    setTimeout(() => {
      mainWindow.show()
      if (DEV || JSON.parse(process.env.COSMOS_DEVTOOLS || `false`)) {
        mainWindow.webContents.openDevTools()
        // we need to reload at this point to make sure sourcemaps are loaded correctly
        mainWindow.reload()
      }
      if (DEV) {
        mainWindow.maximize()
      }
    }, 300)
  })

  // start vue app
  mainWindow.loadURL(winURL)

  mainWindow.on(`closed`, shutdown)

  // eslint-disable-next-line no-console
  log(`mainWindow opened`)

  // handle opening external links in OS's browser
  let webContents = mainWindow.webContents
  let handleRedirect = (e, url) => {
    if (url !== webContents.getURL()) {
      e.preventDefault()
      require(`electron`).shell.openExternal(url)
    }
  }
  webContents.on(`will-navigate`, handleRedirect)
  webContents.on(`new-window`, handleRedirect)

  addMenu(mainWindow)
}

function startProcess(name, args, env) {
  let binPath
  if (process.env.BINARY_PATH) {
    binPath = process.env.BINARY_PATH
  } else if (DEV) {
    // in development use the build gaia files from running `yarn build:gaia`
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
    binPath = join(__dirname, `../../../builds/Gaia`, osFolderName, name)
  } else {
    // in production mode, use binaries packaged with app
    binPath = join(__dirname, `..`, `bin`, name)
  }

  let argString = args.map(arg => JSON.stringify(arg)).join(` `)
  log(`spawning ${binPath} with args "${argString}"`)
  let child
  try {
    child = childProcess.spawn(binPath, args, env)
  } catch (error) {
    log(`Err: Spawning ${name} failed`, error)
    throw error
  }
  child.stdout.on(`data`, data => !shuttingDown && log(`${name}: ${data}`))
  child.stderr.on(`data`, data => !shuttingDown && log(`${name}: ${data}`))

  // Make stdout more useful by emitting a line at a time.
  readline.createInterface({ input: child.stdout }).on(`line`, line => {
    child.stdout.emit(`line`, line)
  })

  // Make stderr more useful by emitting a line at a time.
  readline.createInterface({ input: child.stderr }).on(`line`, line => {
    child.stderr.emit(`line`, line)
  })

  child.on(
    `exit`,
    code => !shuttingDown && log(`${name} exited with code ${code}`)
  )
  child.on(`error`, async function(error) {
    if (!(shuttingDown && error.code === `ECONNRESET`)) {
      // if we throw errors here, they are not handled by the main process
      let errorMessage = [
        `[Uncaught Exception] Child`,
        name,
        `produced an unhandled exception:`,
        error
      ]
      logError(...errorMessage)
      console.error(...errorMessage) // also output to console for easier debugging
      handleCrash(error)

      Sentry.captureException(error)
    }
  })

  // need to kill child processes if main process dies
  process.on(`exit`, () => {
    child.kill()
  })
  return child
}

app.on(`window-all-closed`, () => {
  app.quit()
})

app.on(`activate`, () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on(`ready`, () => createWindow())

// start lcd REST API
async function startLCD(home, nodeURL) {
  assert.equal(
    gaiaLiteProcess,
    null,
    `Can't start Gaia Lite because it's already running.  Call StopLCD first.`
  )

  let lcdStarted = false // remember if the lcd has started to toggle the right error handling if it crashes async
  return new Promise(async (resolve, reject) => {
    log(`startLCD`, home)
    let child = startProcess(LCD_BINARY_NAME, [
      `rest-server`,
      `--laddr`,
      `tcp://localhost:${LCD_PORT}`,
      `--home`,
      home,
      `--node`,
      nodeURL,
      `--chain-id`,
      chainId,
      `--trust-node`,
      true
    ])
    logProcess(child, join(home, `lcd.log`))

    child.stdout.on(`line`, line => {
      if (/\(cert: "(.+?)"/.test(line)) {
        const certPath = /\(cert: "(.+?)"/.exec(line)[1]
        resolve({ ca: fs.readFileSync(certPath, `utf8`), process: child })
        lcdStarted = true
        child.stdout.removeAllListeners(`line`)
      }
    })

    child.stderr.on(`line`, error => {
      let errorMessage = `The gaiacli rest-server (LCD) experienced an error:\n${error.toString(
        `utf8`
      )}`.substr(0, 1000)
      lcdStarted
        ? handleCrash(errorMessage) // if fails later
        : reject(errorMessage) // if fails immediatly
    })
  })
}

function stopLCD() {
  return new Promise((resolve, reject) => {
    if (!gaiaLiteProcess) {
      resolve()
      return
    }
    log(`Stopping the LCD server`)
    try {
      // prevent the exit to signal bad termination warnings
      gaiaLiteProcess.removeAllListeners(`exit`)
      gaiaLiteProcess.on(`exit`, () => {
        gaiaLiteProcess = null
        resolve()
      })
      gaiaLiteProcess.kill(`SIGKILL`)
    } catch (error) {
      handleCrash(error)
      reject(`Stopping the LCD resulted in an error: ${error.message}`)
    }
  })
}

async function getGaiacliVersion() {
  let child = startProcess(LCD_BINARY_NAME, [`version`])
  let data = await new Promise(resolve => {
    child.stdout.on(`data`, resolve)
  })
  return data.toString(`utf8`).trim()
}

function exists(path) {
  try {
    fs.accessSync(path)
    return true
  } catch (error) {
    if (error.code !== `ENOENT`) throw error
    return false
  }
}

// this function will call the passed in callback when the view is booted
// the purpose is to send events to the view thread only after it is ready to receive those events
// if we don't do this, the view thread misses out on those (i.e. an error that occures before the view is ready)
function afterBooted(cb) {
  // in tests we trigger the booted callback always, this causes those events to be sent twice
  // this is why we skip the callback if the message was sent already
  let sent = false
  ipcMain.on(`booted`, () => {
    cb()
    sent = true
  })
  if (booted && !sent) {
    cb()
  }
}

/*
 * log to file
 */
function setupLogging(root) {
  if (!LOGGING) return

  // initialize log file
  let logFilePath = join(root, `main.log`)
  fs.ensureFileSync(logFilePath)
  let mainLog = fs.createWriteStream(logFilePath, { flags: `a` }) // 'a' means appending (old data will be preserved)
  mainLog.write(`${new Date()} Running Cosmos-UI\r\n`)
  // mainLog.write(`${new Date()} Environment: ${JSON.stringify(process.env)}\r\n`) // TODO should be filtered before adding it to the log
  streams.push(mainLog)

  log(`Redirecting console output to logfile`, logFilePath)
  // redirect stdout/err to logfile
  // TODO overwriting console.log sounds like a bad idea, can we find an alternative?
  // eslint-disable-next-line no-func-assign
  log = function(...args) {
    if (DEV) {
      console.log(...args)
    }
    mainLog.write(`main-process: ${args.join(` `)}\r\n`)
  }
  // eslint-disable-next-line no-func-assign
  logError = function(...args) {
    if (DEV) {
      console.error(...args)
    }
    mainLog.write(`main-process: ${args.join(` `)}\r\n`)
  }
}

if (!TEST) {
  process.on(`exit`, shutdown)
  // on uncaught exceptions we wait so the sentry event can be sent
  process.on(`uncaughtException`, async function(error) {
    logError(`[Uncaught Exception]`, error)
    Sentry.captureException(error)
    handleCrash(error)
  })
  process.on(`unhandledRejection`, async function(error) {
    logError(`[Unhandled Promise Rejection]`, error)
    Sentry.captureException(error)
    handleCrash(error)
  })
}

const eventHandlers = {
  booted: () => {
    log(`View has booted`)
    booted = true
  },

  "error-collection": (event, optin) => {
    if (optin) {
      Sentry.init({
        dsn: config.sentry_dsn,
        release: `voyager@${pkgVersion}`
      })
    } else {
      Sentry.init({})
    }
  },

  mocked: value => {
    global.config.mocked = value
  },

  reconnect: () => reconnect(),

  "stop-lcd": () => stopLCD(),

  "successful-launch": () => {
    console.log(`[START SUCCESS] Vue app successfuly started`)
  }
}

// handle ipc messages from the renderer process
Object.entries(eventHandlers).forEach(([event, handler]) => {
  ipcMain.on(event, handler)
})

// test an actual node version against the expected one and flag the node if incompatible
async function testNodeVersion(client, expectedGaiaVersion) {
  let result = await client.nodeVersion()
  let nodeVersion = result.split(`-`)[0]
  let semverDiff = semver.diff(nodeVersion, expectedGaiaVersion)
  if (semverDiff === `patch` || semverDiff === null) {
    return { compatible: true, nodeVersion }
  }

  return { compatible: false, nodeVersion }
}

// Proxy requests to Axios through the main process because we need
// Node.js in order to support self-signed TLS certificates.
const AxiosListener = axios => {
  return async (event, id, options) => {
    let response

    try {
      response = {
        value: await axios(options)
      }
    } catch (exception) {
      response = { exception }
    }

    event.sender.send(`Axios/${id}`, response)
  }
}

// check if our node is reachable and the SDK version is compatible with the local one
async function pickAndConnect() {
  let nodeURL = config.node_lcd
  connecting = true
  let certificate

  try {
    certificate = (await connect(nodeURL)).ca
  } catch (error) {
    handleCrash(error)
    return
  }

  // make the tls certificate available to the view process
  // https://en.wikipedia.org/wiki/Certificate_authority
  global.config.ca = certificate
  const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ ca: certificate })
  })

  let compatible, nodeVersion
  try {
    const client = LcdClient(axiosInstance, config.node_lcd)
    const out = await testNodeVersion(client, expectedGaiaCliVersion)

    compatible = out.compatible
    nodeVersion = out.nodeVersion
  } catch (error) {
    logError(
      `Error in getting node SDK version, assuming node is incompatible. Error:`,
      error
    )
    await stopLCD()

    // retry
    setTimeout(pickAndConnect, 2000)
    return
  }

  if (!compatible) {
    let message = `Node ${nodeURL} uses SDK version ${nodeVersion} which is incompatible to the version used in Voyager ${expectedGaiaCliVersion}`
    log(message)
    await stopLCD()

    // retry
    setTimeout(pickAndConnect, 2000)
    return
  }

  ipcMain.removeAllListeners(`Axios`)
  ipcMain.on(`Axios`, AxiosListener(axiosInstance))

  afterBooted(() => {
    log(`Signaling connected node`)
    mainWindow.webContents.send(`connected`, {
      lcdURL: config.node_lcd,
      rpcURL: config.node_rpc
    })
  })
}

async function connect() {
  log(`starting gaia rest server with nodeURL ${config.node_lcd}`)

  const { ca, process } = await startLCD(lcdHome, config.node_rpc)
  gaiaLiteProcess = process
  log(`gaia rest server ready`)

  connecting = false
  return { ca, process }
}

async function reconnect() {
  if (connecting) return
  log(`Starting reconnect`)
  connecting = true

  await stopLCD()

  await pickAndConnect()
}

function checkConsistentConfigDir(
  appVersionPath,
  genesisPath,
  configPath,
  gaiacliVersionPath
) {
  let missingFile =
    (!exists(genesisPath) && genesisPath) ||
    (!exists(appVersionPath) && appVersionPath) ||
    (!exists(configPath) && configPath) ||
    (!exists(gaiacliVersionPath) && gaiacliVersionPath)
  if (missingFile) {
    throw Error(
      `The data directory (${root}) is missing ${relative(root, missingFile)}`
    )
  } else {
    let existingVersion = fs.readFileSync(appVersionPath, `utf8`).trim()
    let semverDiff = semver.diff(existingVersion, pkgVersion)
    let compatible = semverDiff !== `major` && semverDiff !== `minor`
    if (compatible) {
      log(`configs are compatible with current app version`)
    } else {
      // TODO: versions of the app with different data formats will need to learn how to
      // migrate old data
      throw Error(`Data was created with an incompatible app version
        data=${existingVersion} app=${pkgVersion}`)
    }
  }
}

const checkGaiaCompatibility = async gaiacliVersionPath => {
  // XXX: currently ignores commit hash
  let gaiacliVersion = (await getGaiacliVersion()).split(`-`)[0]

  expectedGaiaCliVersion = fs
    .readFileSync(gaiacliVersionPath, `utf8`)
    .trim()
    .split(`-`)[0]

  log(
    `gaiacli version: "${gaiacliVersion}", expected: "${expectedGaiaCliVersion}"`
  )

  let compatible =
    semver.major(gaiacliVersion) == semver.major(expectedGaiaCliVersion) &&
    semver.minor(gaiacliVersion) == semver.minor(expectedGaiaCliVersion)

  if (!compatible) {
    throw Error(
      `The network you are trying to connect to requires gaia ${expectedGaiaCliVersion}, but the version Voyager is using is ${gaiacliVersion}.${
        DEV
          ? ` Please update "tasks/build/Gaia/COMMIT.sh" with the required version and run "yarn build:gaia".`
          : ``
      }`
    )
  }
}

async function main() {
  // Sentry is used for automatic error reporting. It is turned off by default.
  Sentry.init({})

  let appVersionPath = join(root, `app_version`)
  let genesisPath = join(root, `genesis.json`)
  let configPath = join(root, `config.toml`)
  let gaiacliVersionPath = join(root, `gaiaversion.txt`)

  let rootExists = exists(root)
  await fs.ensureDir(root)

  setupLogging(root)

  if (rootExists) {
    log(`root exists (${root})`)

    // NOTE: when changing this code, always make sure the app can never
    // overwrite/delete existing data without at least backing it up,
    // since it may contain the user's private keys and they might not
    // have written down their seed words.
    // they might get pretty mad if the app deletes their money!

    // check if the existing data came from a compatible app version
    // if not, fail with an error
    checkConsistentConfigDir(
      appVersionPath,
      genesisPath,
      configPath,
      gaiacliVersionPath
    )

    // check to make sure the genesis.json we want to use matches the one
    // we already have. if it has changed, replace it with the new one
    let existingGenesis = fs.readFileSync(genesisPath, `utf8`)
    let genesisJSON = JSON.parse(existingGenesis)
    // skip this check for local testnet
    if (genesisJSON.chain_id !== `local`) {
      let specifiedGenesis = fs.readFileSync(
        join(networkPath, `genesis.json`),
        `utf8`
      )
      if (existingGenesis.trim() !== specifiedGenesis.trim()) {
        fs.copySync(networkPath, root)
        log(
          `genesis.json at "${genesisPath}" was overridden by genesis.json from "${networkPath}"`
        )
      }
    }
  } else {
    log(`initializing data directory (${root})`)
    await fs.ensureDir(root)

    // copy predefined genesis.json and config.toml into root
    fs.accessSync(networkPath) // crash if invalid path
    fs.copySync(networkPath, root)

    fs.writeFileSync(appVersionPath, pkgVersion)
  }

  await checkGaiaCompatibility(gaiacliVersionPath)

  // read chainId from genesis.json
  let genesisText = fs.readFileSync(genesisPath, `utf8`)
  let genesis = JSON.parse(genesisText)
  chainId = genesis.chain_id // is set globaly

  // choose one random node to start from
  await pickAndConnect()
}
module.exports = main()
  .catch(error => {
    logError(error)
    handleCrash(error)
  })
  .then(() => ({
    shutdown,
    processes: { gaiaLiteProcess },
    eventHandlers,
    getGaiaLiteProcess: () => gaiaLiteProcess
  }))
