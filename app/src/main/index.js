'use strict'

import { app, BrowserWindow } from 'electron'
import fs from 'fs-extra'
import { join } from 'path'
import { spawn } from 'child_process'
import home from 'user-home'
import watt from 'watt'
import mkdirp from 'mkdirp'

let mainWindow
let tendermintNode
const DEV = process.env.NODE_ENV === 'development'
const winURL = DEV
  ? `http://localhost:${require('../../../config').port}`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    minWidth: 320,
    minHeight: 480,
    width: 320,
    height: 840
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null

    if (tendermintNode) {
      tendermintNode.kill()
      tendermintNode = null
    }
  })

  // eslint-disable-next-line no-console
  console.log('mainWindow opened')
}

function startProcess (name, ...args) {
  let binPath
  if (DEV) {
    let GOPATH = process.env.GOPATH
    if (!GOPATH) GOPATH = join(home, 'go')
    binPath = join(GOPATH, 'bin', name)
  } else {
    binPath = join(__dirname, 'bin', name)
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
function startBasecoin (root, cb) {
  let log = fs.createWriteStream(join(root, 'basecoin.log'))
  let child = startProcess('basecoin', ['start'], { env: { BCHOME: root } })
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

let createDataDir = watt(function * (root, next) {
  let err = yield fs.access(root, next.arg(0))
  if (err && err.code !== 'ENOENT') throw err
  if (!err) return

  yield mkdirp(root, next)
  yield mkdirp(join(root, 'wallets'), next)

  // copy predefined genesis.json into root
  yield fs.copy(join(__dirname, '../../bchome'), root, next)

  // `basecoin init` to generate account keys, validator key
  let child = startProcess('basecoin', ['init'], { env: { BCHOME: root } })
  yield child.on('exit', next.arg(0))
})

watt(function * (next) {
  let root = require('../root.js')
  yield createDataDir(root)
  console.log('starting basecoin')
  tendermintNode = yield startBasecoin(root, next)
  console.log('basecoin ready')
  process.on('exit', () => {
    if (tendermintNode) {
      tendermintNode.kill()
      tendermintNode = null
    }
  })
})()
