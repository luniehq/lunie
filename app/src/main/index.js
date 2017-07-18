'use strict'

import { app, BrowserWindow } from 'electron'
import fs from 'fs-extra'
import { join } from 'path'
import { spawn } from 'child_process'
import home from 'user-home'
import watt from 'watt'
import mkdirp from 'mkdirp'

let mainWindow
let basecoinProcess
const DEV = process.env.NODE_ENV === 'development'
const LIGHT = process.env.BASECOIN_LIGHT_CLIENT
const winURL = DEV
  ? `http://localhost:${require('../../../config').port}`
  : `file://${__dirname}/index.html`

// what host the light client should connect to
let BASECOIN_PEER = process.env.BASECOIN_PEER || 'localhost:46657'

let NODE_BINARY = 'gaia'
let LIGHT_CLIENT_BINARY = 'gaiacli'

// if (DEV) {
  // Install `electron-debug` with `devtron`
  // require('electron-debug')({ showDevTools: true })
// }

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    minWidth: 320,
    minHeight: 480,
    width: 800,
    height: 600
  })
  mainWindow.maximize()

  mainWindow.loadURL(winURL)
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null

    if (basecoinProcess) {
      basecoinProcess.kill()
      basecoinProcess = null
    }
  })

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
}

function startProcess (name, ...args) {
  let binPath
  if (DEV) {
    let GOPATH = process.env.GOPATH
    if (!GOPATH) GOPATH = join(home, 'go')
    binPath = join(GOPATH, 'bin', name)
  } else {
    binPath = join(__dirname, '..', 'bin', name)
  }

  let child = spawn(binPath, ...args)
  child.stdout.on('data', (data) => console.log(`${name}: ${data}`))
  child.stderr.on('data', (data) => console.log(`${name}: ${data}`))
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
function startBasecoin (root, light, cb) {
  let log = fs.createWriteStream(join(root, 'basecoin.log'))
  let opts = {
    env: {
      BCHOME: root,
      TMROOT: root
    }
  }

  let child
  if (light) {
    // TODO: figure out what node to connect to
    // TODO: configurable chainid
    child = startProcess(LIGHT_CLIENT_BINARY, [
      'proxy',
      '--node', `tcp://${BASECOIN_PEER}`,
      '--chainid', 'test_chain_id',
      '--home', root
    ], opts)
  } else {
    child = startProcess(NODE_BINARY, [
      'start',
      '--home', root
    ], opts)
  }

  child.stdout.on('data', waitForRpc)
  child.stdout.pipe(log)
  child.stderr.pipe(log)
  function waitForRpc (data) {
    if (!data.toString().includes('Starting RPC HTTP server')) return
    child.removeListener('data', waitForRpc)
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

let createDataDir = watt(function * (root, light, next) {
  let err = yield fs.access(root, next.arg(0))
  if (err && err.code !== 'ENOENT') throw err
  if (!err) return
  let opts = {
    env: {
      BCHOME: root,
      TMROOT: root
    }
  }

  yield mkdirp(root, next)

  let child
  if (light) {
    // `basecli init` to set up light client stuff
    child = startProcess(LIGHT_CLIENT_BINARY, [
      'init',
      '--node', `tcp://${BASECOIN_PEER}`,
      '--chainid', 'test_chain_id',
      '--home', root
    ], opts)
    child.stdin.write('y\n')
    yield child.on('exit', next.arg(0))
  } else {
    // copy predefined genesis.json and config.toml into root
    let bchome = yield initialBchomeDataPath()
    yield fs.copy(bchome, root, next)

    // `basecoin init` to generate account keys, validator key
    child = startProcess(NODE_BINARY, [
      'init',
      '1B1BE55F969F54064628A63B9559E7C21C925165',
      '--home', root
    ], opts)
    yield child.on('exit', next.arg(0))
  }

  yield mkdirp(join(root, 'wallets'), next)

  if (DEV && !light) {
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

watt(function * (next) {
  let root = require('../root.js')
  yield createDataDir(root, LIGHT)
  console.log(`starting basecoin${LIGHT ? ' light client proxy' : ''}`)
  basecoinProcess = yield startBasecoin(root, LIGHT, next)
  console.log('basecoin ready')
  process.on('exit', () => {
    if (basecoinProcess) {
      basecoinProcess.kill()
      basecoinProcess = null
    }
  })
})()
