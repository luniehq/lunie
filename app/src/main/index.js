    'use strict'

let { app, BrowserWindow, Menu } = require('electron')
let fs = require('fs-extra')
let { join } = require('path')
let { spawn } = require('child_process')
let home = require('user-home')
let semver = require('semver')
// this dependency is wrapped in a file as it was not possible to mock the import with jest any other way
let event = require('event-to-promise')
let toml = require('toml')
let pkg = require('../../../package.json')
let rmdir = require('../helpers/rmdir.js')
let mockServer = require('./mockServer.js')

let shuttingDown = false
let mainWindow
let baseserverProcess
let streams = []
let nodeIP
const WIN = /^win/.test(process.platform)
const DEV = process.env.NODE_ENV === 'development'
const TEST = JSON.parse(process.env.COSMOS_TEST || 'false') !== false
// TODO default logging or default disable logging?
const LOGGING = JSON.parse(process.env.LOGGING || DEV) !== false
const winURL = DEV
  ? `http://localhost:${require('../../../config').port}`
  : `file://${__dirname}/index.html`

// this network gets used if none is specified via the
// COSMOS_NETWORK env var
let DEFAULT_NETWORK = join(__dirname, '../networks/gaia-1')
let networkPath = process.env.COSMOS_NETWORK || DEFAULT_NETWORK

let SERVER_BINARY = 'gaia' + (WIN ? '.exe' : '')

function log (...args) {
  if (LOGGING) {
    console.log(...args)
  }
}
function logError (...args) {
  if (LOGGING) {
    console.log(...args)
  }
}

function logProcess (process, logPath) {
  fs.ensureFileSync(logPath)
  // Writestreams are blocking fs cleanup in tests, if you get errors, disable logging
  if (LOGGING && !TEST) {
    let logStream = fs.createWriteStream(logPath, {
      flags: 'a' // 'a' means appending (old data will be preserved)
    })
    streams.push(logStream)
    process.stdout.pipe(logStream)
    process.stderr.pipe(logStream)
  }
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function expectCleanExit (process, errorMessage = 'Process exited unplanned') {
  return new Promise((resolve, reject) => {
    process.on('exit', code => {
      if (code !== 0 && !shuttingDown) {
        throw new Error(errorMessage)
      }
      resolve()
    })
  })
}

function shutdown () {
  if (shuttingDown) return

  mainWindow = null
  shuttingDown = true

  if (baseserverProcess) {
    log('killing baseserver')
    baseserverProcess.kill('SIGKILL')
    baseserverProcess = null
  }

  return Promise.all(
    streams.map(stream => new Promise((resolve) => stream.close(resolve)))
  )
}

function createWindow () {
  mainWindow = new BrowserWindow({
    minWidth: 320,
    minHeight: 480,
    width: 1200,
    height: 800,
    webPreferences: { webSecurity: false }
  })
  // mainWindow.maximize()

  mainWindow.loadURL(winURL + '?node=' + nodeIP)
  if (DEV || process.env.COSMOS_DEVTOOLS) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', shutdown)

  // eslint-disable-next-line no-console
  log('mainWindow opened')

  // handle opening external links in OS's browser
  let webContents = mainWindow.webContents
  let handleRedirect = (e, url) => {
    if (url !== webContents.getURL()) {
      e.preventDefault()
      require('electron').shell.openExternal(url)
    }
  }
  webContents.on('will-navigate', handleRedirect)
  webContents.on('new-window', handleRedirect)

  // setup menu to handle copy/paste, etc
  var template = [
    {
      label: 'Cosmos UI',
      submenu: [
        { label: 'About Cosmos UI', selector: 'orderFrontStandardAboutPanel:' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function startProcess (name, args, env) {
  let binPath
  if (DEV || TEST) {
    // in dev mode or tests, use binaries installed in GOPATH
    let GOPATH = process.env.GOPATH
    if (!GOPATH) GOPATH = join(home, 'go')
    binPath = join(GOPATH, 'bin', name)
  } else {
    // in production mode, use binaries packaged with app
    binPath = join(__dirname, '..', 'bin', name)
  }

  let argString = args.map((arg) => JSON.stringify(arg)).join(' ')
  log(`spawning ${binPath} with args "${argString}"`)
  let child
  try {
    child = spawn(binPath, args, env)
  } catch (err) {
    log(`Err: Spawning ${name} failed`, err)
    throw err
  }
  child.stdout.on('data', (data) => !shuttingDown && log(`${name}: ${data}`))
  child.stderr.on('data', (data) => !shuttingDown && log(`${name}: ${data}`))
  child.on('exit', (code) => !shuttingDown && log(`${name} exited with code ${code}`))
  child.on('error', function (err) {
    if (!(shuttingDown && err.code === 'ECONNRESET')) {
      // Ignore ECONNRESET and re throw anything else
      throw err
    }
  })
  return child
}

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('ready', () => createWindow())

// start baseserver REST API
async function startBaseserver (home) {
  log('startBaseserver', home)
  let child = startProcess(SERVER_BINARY, [
    'server',
    'serve',
    '--home', home // ,
    // '--trust-node'
  ])
  logProcess(child, join(home, 'baseserver.log'))

  // restore baseserver if it crashes
  child.on('exit', async () => {
    if (shuttingDown) return
    log('baseserver crashed, restarting')
    await sleep(1000)
    await startBaseserver(home)
  })

  while (true) {
    if (shuttingDown) break

    let data = await event(child.stderr, 'data')
    if (data.toString().includes('Serving on')) break
  }

  return child
}

function exists (path) {
  try {
    fs.accessSync(path)
    return true
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    return false
  }
}

async function initBaseserver (chainId, home, node) {
  // fs.ensureDirSync(home)
  // `baseserver init` to generate config, trust seed
  let child = startProcess(SERVER_BINARY, [
    'server',
    'init',
    '--home', home,
    '--chain-id', chainId,
    '--node', node
    // '--trust-node'
  ])
  child.stdout.on('data', (data) => {
    if (shuttingDown) return
    // answer 'y' to the prompt about trust seed. we can trust this is correct
    // since the baseserver is talking to our own full node
    child.stdin.write('y\n')
  })
  await expectCleanExit(child, 'gaia init exited unplanned')
}

async function backupData (root) {
  let i = 1
  let path
  do {
    path = `${root}_backup_${i}`
    i++
  } while (exists(path))

  log(`backing up data to "${path}"`)
  fs.copySync(root, path, {
    overwrite: false,
    errorOnExist: true
  })
  await rmdir(root)
}

/*
* log to file
*/
function setupLogging (root) {
  if (TEST) return

  // initialize log file
  let logFilePath = join(root, 'main.log')
  fs.ensureFileSync(logFilePath)
  let mainLog = fs.createWriteStream(logFilePath, {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })
  mainLog.write(`${new Date()} Running Cosmos-UI\r\n`)
  // mainLog.write(`${new Date()} Environment: ${JSON.stringify(process.env)}\r\n`) // TODO should be filtered before adding it to the log
  streams.push(mainLog)

  log('Redirecting console output to logfile', logFilePath)
  // redirect stdout/err to logfile
  // TODO overwriting console.log sounds like a bad idea, can we find an alternative?
  // eslint-disable-next-line no-func-assign
  log = function (...args) {
    if (LOGGING) {
      if (DEV) {
        console.log(...args)
      }
      mainLog.write(`main-process: ${args.join(' ')}\r\n`)
    }
  }
  // eslint-disable-next-line no-func-assign
  logError = function (...args) {
    if (LOGGING) {
      if (DEV) {
        console.error(...args)
      }
      mainLog.write(`main-process: ${args.join(' ')}\r\n`)
    }
  }
}

process.on('exit', shutdown)
process.on('uncaughtException', function (err) {
  logError('[Uncaught Exception]', err)
  setTimeout(shutdown, 200)
  err.message = '[Uncaught Exception] ' + err.message
  process.exit(1)
})

async function main () {
  let root = require('../root.js')
  let versionPath = join(root, 'app_version')
  let genesisPath = join(root, 'genesis.json')

  let rootExists = exists(root)
  await fs.ensureDir(root)

  setupLogging(root)

  let init = true
  if (rootExists) {
    log(`root exists (${root})`)

    // check if the existing data came from a compatible app version
    // if not, backup the data and re-initialize
    if (exists(versionPath)) {
      let existingVersion = fs.readFileSync(versionPath, 'utf8')
      let compatible = semver.diff(existingVersion, pkg.version) !== 'major'
      if (compatible) {
        log('configs are compatible with current app version')
        init = false
      } else {
        await backupData(root)
      }
    } else {
      await backupData(root)
    }

    // check to make sure the genesis.json we want to use matches the one
    // we already have. if it has changed, back up the old data
    if (!init) {
      let existingGenesis = fs.readFileSync(genesisPath, 'utf8')
      let genesisJSON = JSON.parse(existingGenesis)
      // skip this check for local testnet
      if (genesisJSON.chain_id !== 'local') {
        let specifiedGenesis = fs.readFileSync(join(networkPath, 'genesis.json'), 'utf8')
        if (existingGenesis.trim() !== specifiedGenesis.trim()) {
          log('genesis has changed')
          await backupData(root)
          init = true
        }
      }
    }
  }

  if (init) {
    log(`initializing data directory (${root})`)
    await fs.ensureDir(root)

    // copy predefined genesis.json and config.toml into root
    fs.accessSync(networkPath) // crash if invalid path
    fs.copySync(networkPath, root)

    fs.writeFileSync(versionPath, pkg.version)
  }

  log('starting app')
  log(`dev mode: ${DEV}`)
  log(`winURL: ${winURL}`)

  // read chainId from genesis.json
  let genesisText = fs.readFileSync(genesisPath, 'utf8')
  let genesis = JSON.parse(genesisText)
  let chainId = genesis.chain_id

  // pick a random seed node from config.toml
  // TODO: user-specified nodes, support switching?
  let configText
  try {
    configText = fs.readFileSync(join(root, 'config.toml'), 'utf8')
  } catch (e) {
    throw new Error(`Can't open config.toml: ${e.message}`)
  }
  let config = toml.parse(configText)
  let seeds = config.p2p.seeds.split(',')
  if (config.p2p.seeds === '' || seeds.length === 0) {
    throw new Error('No seeds specified in config.toml')
  }
  nodeIP = seeds[Math.floor(Math.random() * seeds.length)]
  log('Picked seed:', nodeIP, 'of', seeds)
  // replace port with default RPC port
  nodeIP = `${nodeIP.split(':')[0]}:46657`
  log(`Initializing baseserver with remote node ${nodeIP}`)

  let baseserverHome = join(root, 'baseserver')
  if (init) {
    await initBaseserver(chainId, baseserverHome, nodeIP)
  }

  log('starting gaia server')
  baseserverProcess = await startBaseserver(baseserverHome)
  log('gaia server ready')

  // start mock API server on port 8999
  mockServer(8999)
}
module.exports = Object.assign(
  main()
  .catch(err => {
    logError(err)
    throw err
  })
  .then(() => ({
    shutdown,
    processes: {baseserverProcess}
  }))
)
