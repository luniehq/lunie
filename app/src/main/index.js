'use strict'

import { app, BrowserWindow, Menu } from 'electron'
import fs from 'fs-extra'
import { join } from 'path'
import { spawn } from 'child_process'
import home from 'user-home'
import watt from 'watt'
import mkdirp from 'mkdirp'
import RpcClient from 'tendermint'

let mainWindow
let basecoinProcess, baseserverProcess
const DEV = process.env.NODE_ENV === 'development'
const winURL = DEV
  ? `http://localhost:${require('../../../config').port}`
  : `file://${__dirname}/index.html`

let NODE_BINARY = 'basecoin'
let SERVER_BINARY = 'baseserver'

function shutdown () {
  mainWindow = null

  if (basecoinProcess) {
    basecoinProcess.kill()
    basecoinProcess = null
  }
  if (baseserverProcess) {
    baseserverProcess.kill()
    baseserverProcess = null
  }
}

function createWindow () {
  mainWindow = new BrowserWindow({
    minWidth: 320,
    minHeight: 480,
    width: 800,
    height: 600,
    webPreferences: { webSecurity: false }
  })
  mainWindow.maximize()

  mainWindow.loadURL(winURL)
  if (DEV) mainWindow.webContents.openDevTools()

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
  if (DEV) {
    // in dev mode, use binaries installed in GOPATH
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
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// start basecoin/tendermint node
function startBasecoin (root, cb) {
  let log = fs.createWriteStream(join(root, 'basecoin.log'))
  let opts = {
    env: {
      BCHOME: root,
      TMROOT: root
    }
  }

  let args = [
    'start',
    '--home', root
  ]
  if (DEV) args.push('--log_level', 'info')
  let child = startProcess(NODE_BINARY, args, opts)
  child.stdout.pipe(log)
  child.stderr.pipe(log)

  let rpc = RpcClient('localhost:46657')
  let interval = setInterval(() => {
    rpc.status((err, res) => {
      if (err) return
      if (!res) return
      if ((res.latest_block_time / 1e6) < (Date.now() - 1000 * 60 * 60 * 24)) return
      done()
    })
  }, 1000)
  function done (err) {
    clearInterval(interval)
    cb(err)
  }

  return child
}

// start baseserver REST API
function startBaseserver (home, cb) {
  console.log('startBaseserver', home)
  let log = fs.createWriteStream(join(home, 'baseserver.log'))

  let child = startProcess(SERVER_BINARY, [
    'serve',
    '--home', home
  ])
  child.stderr.on('data', waitForReady)
  child.stdout.pipe(log)
  child.stderr.pipe(log)
  function waitForReady (data) {
    if (!data.toString().includes('Serving on')) return
    child.removeListener('data', waitForReady)
    cb(null)
  }
  return child
}

let initialBchomeDataPath = watt(function * (next) {
  let path = join(__dirname, '../../bchome')
  let err = yield fs.access(path, next.arg(0))
  if (err && err.code !== 'ENOENT') throw err
  if (err && err.code === 'ENOENT') {
    return join(__dirname, '../bchome')
  }
  return path
})

let initBasecoin = watt(function * (root, next) {
  let err = yield fs.access(root, next.arg(0))
  if (err && err.code !== 'ENOENT') throw err
  if (!err) return // if already exists, skip init
  let opts = {
    env: {
      BCHOME: root,
      TMROOT: root
    }
  }

  yield mkdirp(root, next)

  // copy predefined genesis.json and config.toml into root
  let bchome = yield initialBchomeDataPath()
  yield fs.copy(bchome, root, next)

  // `basecoin init` to generate account keys, validator key
  let child = startProcess(NODE_BINARY, [
    'init',
    // currently using hardcoded address
    '1B1BE55F969F54064628A63B9559E7C21C925165',
    '--home', root
  ], opts)
  yield child.on('exit', next.arg(0))

  if (DEV) {
    // insert our pubkey into genesis validator set
    let privValidatorBytes = yield fs.readFile(join(root, 'priv_validator.json'), next)
    let privValidator = JSON.parse(privValidatorBytes.toString())
    let genesisBytes = yield fs.readFile(join(root, 'genesis.json'), next)
    let genesis = JSON.parse(genesisBytes.toString())
    genesis.validators[0].pub_key = privValidator.pub_key
    genesisBytes = JSON.stringify(genesis, null, '  ')
    yield fs.writeFile(join(root, 'genesis.json'), genesisBytes, next)
  }
})

let initBaseserver = watt(function * (home, next) {
  let err = yield fs.access(home, next.arg(0))
  if (err && err.code !== 'ENOENT') throw err
  if (!err) return // if already exists, skip init

  yield mkdirp(home, next)

  // `baseserver init` to generate config, trust seed
  let child = startProcess(SERVER_BINARY, [
    'init',
    '--home', home,
    '--chain-id', 'mercury', // TODO: configurable
    '--node', 'localhost:46657'
  ])
  child.stdout.on('data', (data) => {
    // answer 'y' to the prompt about trust seed. we can trust this is correct
    // since the baseserver is talking to our own full node
    child.stdin.write('y\n')
  })
  yield child.on('exit', next.arg(0))
})

process.on('exit', shutdown)

watt(function * (next) {
  let root = require('../root.js')
  yield initBasecoin(root)

  console.log('starting basecoin')
  basecoinProcess = yield startBasecoin(root, next)
  console.log('basecoin ready')

  let baseserverHome = join(root, 'baseserver')
  yield initBaseserver(baseserverHome)

  console.log('starting baseserver')
  baseserverProcess = yield startBaseserver(baseserverHome, next)
  console.log('baseserver ready')
})()
