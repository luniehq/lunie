'use strict'

let { app, BrowserWindow, Menu } = require('electron')
let fs = require('fs-extra')
let { join } = require('path')
let { spawn } = require('child_process')
let home = require('user-home')
let mkdirp = require('mkdirp').sync
let RpcClient = require('tendermint')
let semver = require('semver')
let event = require('event-to-promise')
let pkg = require('../../package.json')

let shuttingDown = false
let mainWindow
let basecoinProcess, baseserverProcess, tendermintProcess
const DEV = process.env.NODE_ENV === 'development'
const TEST = !!process.env.COSMOS_TEST
const winURL = DEV
  ? `http://localhost:${require('../../../config').port}`
  : `file://${__dirname}/index.html`

// this network gets used if none is specified via the
// COSMOS_NETWORK env var
let DEFAULT_NETWORK = join(__dirname, '../networks/tak')

let NODE_BINARY = 'basecoin'
let SERVER_BINARY = 'baseserver'

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shutdown () {
  mainWindow = null
  shuttingDown = true

  if (basecoinProcess) {
    console.log('killing basecoin')
    basecoinProcess.kill('SIGKILL')
    basecoinProcess = null
  }
  if (baseserverProcess) {
    console.log('killing baseserver')
    baseserverProcess.kill('SIGKILL')
    baseserverProcess = null
  }
  if (tendermintProcess) {
    console.log('killing tendermint')
    tendermintProcess.kill('SIGKILL')
    tendermintProcess = null
  }
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

  mainWindow.loadURL(winURL)
  if (DEV || process.env.COSMOS_DEVTOOLS) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', shutdown)

  // eslint-disable-next-line no-console
  console.log('mainWindow opened')

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
  console.log(`spawning ${binPath} with args "${argString}"`)
  let child = spawn(binPath, args, env)
  child.stdout.on('data', (data) => console.log(`${name}: ${data}`))
  child.stderr.on('data', (data) => console.log(`${name}: ${data}`))
  child.on('exit', (code) => console.log(`${name} exited with code ${code}`))
  return child
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// start basecoin node
function startBasecoin (root) {
  let log = fs.createWriteStream(join(root, 'basecoin.log'))
  let opts = {
    env: {
      BCHOME: root,
      TMROOT: root
    }
  }

  let args = [
    'start',
    '--without-tendermint',
    '--home', root
  ]
  if (DEV) args.push('--log_level', 'info')
  let child = startProcess(NODE_BINARY, args, opts)
  child.stdout.pipe(log)
  child.stderr.pipe(log)
  child.on('exit', code => {
    if (code !== 0) {
      throw new Error('Basecoin exited unplanned')
    }
  })
  return child
}

// start tendermint node
async function startTendermint (root) {
  let log = fs.createWriteStream(join(root, 'tendermint.log'))
  let opts = {
    env: {
      BCHOME: root,
      TMROOT: root
    }
  }

  let args = [
    'node',
    '--home', root
  ]
  // if (DEV) args.push('--log_level', 'info')
  let child = startProcess('tendermint', args, opts)
  child.stdout.pipe(log)
  child.stderr.pipe(log)
  child.on('exit', code => {
    if (code !== 0) {
      throw new Error('Tendermint exited unplanned')
    }
  })

  let rpc = RpcClient('localhost:46657')
  let status = () => new Promise((resolve, reject) => {
    rpc.status((err, res) => {
      // ignore connection errors, since we'll just poll until we get a response
      if (err && err.code !== 'ECONNREFUSED') {
        console.log('Tendermint failed', err)
        reject(err)
        return
      }
      resolve(res)
    })
  })
  while (true) {
    console.log('trying to get tendermint RPC status')
    let res = await status()
    if (res) {
      if (res.latest_block_height > 0) break
      console.log('waiting for blockchain to start syncing')
    }
    await sleep(1000)
  }

  return child
}

// start baseserver REST API
async function startBaseserver (home) {
  console.log('startBaseserver', home)
  const logFile = join(home, 'baseserver.log')
  fs.ensureFileSync(logFile)
  let log = fs.createWriteStream(logFile)

  let child = startProcess(SERVER_BINARY, [
    'serve',
    '--home', home // ,
    // '--trust-node'
  ])
  child.stdout.pipe(log)
  child.stderr.pipe(log)

  // restore baseserver if it crashes
  child.on('exit', async () => {
    if (shuttingDown) return
    console.log('baseserver crashed, restarting')
    await sleep(1000)
    await startBaseserver(home)
  })

  while (true) {
    let data = await event(child.stderr, 'data')
    if (data.toString().includes('Serving on')) break
  }

  return child
}

async function initBasecoin (root) {
  let opts = {
    env: {
      BCHOME: root,
      TMROOT: root
    }
  }

  // `basecoin init` to generate account keys, validator key
  let child = startProcess(NODE_BINARY, [
    'init',
    // currently using hardcoded address
    '1B1BE55F969F54064628A63B9559E7C21C925165',
    '--home', root
  ], opts)
  await event(child, 'exit')

  // copy predefined genesis.json and config.toml into root
  let networkPath = process.env.COSMOS_NETWORK || DEFAULT_NETWORK
  fs.accessSync(networkPath) // crash if invalid path
  fs.copySync(networkPath, root)

  if (DEV || TEST) {
    console.log('adding self to validator set')
    // replace validator set so our node has 100% of voting power
    let privValidatorText = fs.readFileSync(join(root, 'priv_validator.json'), 'utf8')
    let privValidator = JSON.parse(privValidatorText)
    let genesisText = fs.readFileSync(join(root, 'genesis.json'), 'utf8')
    let genesis = JSON.parse(genesisText)
    genesis.validators = [
      {
        pub_key: privValidator.pub_key,
        power: 100,
        name: 'dev_validator'
      }
    ]
    genesisText = JSON.stringify(genesis, null, '  ')
    fs.writeFileSync(join(root, 'genesis.json'), genesisText)
  }
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

async function initBaseserver (chainId, home) {
  // `baseserver init` to generate config, trust seed
  let child = startProcess(SERVER_BINARY, [
    'init',
    '--home', home,
    '--chain-id', chainId,
    '--node', 'localhost:46657' // ,
    // '--trust-node'
  ])
  child.stdout.on('data', (data) => {
    // answer 'y' to the prompt about trust seed. we can trust this is correct
    // since the baseserver is talking to our own full node
    child.stdin.write('y\n')
  })
  await event(child, 'exit')
}

function backupData (root) {
  let i = 1
  let path
  do {
    path = `${root}_backup_${i}`
    i++
  } while (exists(path))

  console.log(`backing up data to "${path}"`)
  fs.copySync(root, path)
}

process.on('exit', shutdown)

async function main () {
  let root = require('../root.js')
  let versionPath = join(root, 'app_version')
  let genesisPath = join(root, 'genesis.json')

  let init = true
  if (exists(root)) {
    console.log(`root exists (${root})`)

    // check if the existing data came from a compatible app version
    // if not, backup the data and re-initialize
    if (exists(versionPath)) {
      let existingVersion = fs.readFileSync(versionPath, 'utf8')
      let compatible = semver.diff(existingVersion, pkg.version) !== 'major'
      if (compatible) init = false
      else backupData(root)
    } else {
      backupData(root)
    }

    // check to make sure the genesis.json we want to use matches the one
    // we already have. if it has changed, back up the old data
    if (!init) {
      let existingGenesis = fs.readFileSync(genesisPath, 'utf8')
      let genesisJSON = JSON.parse(existingGenesis)
      // skip this check for local testnet
      if (genesisJSON.chain_id !== 'local') {
        let specifiedGenesis = fs.readFileSync(join(process.env.COSMOS_NETWORK, 'genesis.json'), 'utf8')
        if (existingGenesis.trim() !== specifiedGenesis.trim()) {
          console.log('genesis has changed')
          backupData(root)
        }
      }
    }
  }

  if (init) {
    console.log(`initializing data directory (${root})`)
    mkdirp(root)
    await initBasecoin(root)
    .catch(e => {
      throw new Error('Initialization of basecoint failed:', e)
    })
    fs.writeFileSync(versionPath, pkg.version)
  }

  if (!DEV) {
    // redirect stdout/err to logfile
    let mainLog = fs.createWriteStream(join(root, 'main.log'))
    console.log = function (...args) {
      mainLog.write(`${args.join(' ')}\n`)
    }
    console.error = function (...args) {
      mainLog.write(`stderr: ${args.join(' ')}\n`)
    }
  }

  console.log('starting app')
  console.log(`dev mode: ${DEV}`)
  console.log(`winURL: ${winURL}`)

  // read chainId from genesis.json
  let genesisText
  try {
    genesisText = fs.readFileSync(genesisPath, 'utf8')
  } catch (e) {
    throw new Error(`Can't open genesis.json: ${e.message}`)
  }
  let genesis = JSON.parse(genesisText)
  let chainId = genesis.chain_id

  console.log('starting basecoin and tendermint')
  basecoinProcess = startBasecoin(root)
  tendermintProcess = await startTendermint(root)
  .catch(e => {
    throw new Error(`Can't start Tendermint: ${e.message}`)
  })
  console.log('basecoin and tendermint are ready')

  let baseserverHome = join(root, 'baseserver')
  if (init) {
    initBaseserver(chainId, baseserverHome)
  }

  console.log('starting baseserver')
  baseserverProcess = await startBaseserver(baseserverHome)
  .catch(e => {
    throw new Error(`Can't start baseserver: ${e.message}`)
  })
  console.log('baseserver ready')
}
main().catch(function (err) {
  console.error(err.stack)
  process.exit(1)
})
