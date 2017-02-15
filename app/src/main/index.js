'use strict'

import { app, BrowserWindow } from 'electron'
import fs from 'fs-extra'
import { join } from 'path'
import { spawn } from 'child_process'
import home from 'user-home'
import watt from 'watt'
import mkdirp from 'mkdirp'

let mainWindow
const DEV = process.env.NODE_ENV === 'development'
const winURL = DEV
  ? `http://localhost:${require('../../../config').port}`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
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
  let tmroot = join(root, 'tendermint')
  let child = startProcess('stakecoin', [
    'start',
    '--in-proc',
    `--dir=${root}`
  ], { env: { TMROOT: tmroot } })
  child.stdout.on('data', waitForRpc)
  function waitForRpc (data) {
    if (!data.toString().includes('Starting RPC HTTP server')) return
    child.removeListener('data', waitForRpc)
    cb(null)
  }
}

let createDataDir = watt(function * (root, next) {
  let err = yield fs.access(root, next.arg(0))
  if (err && err.code !== 'ENOENT') throw err
  if (!err) return

  yield mkdirp(root, next)

  let paths = (base) => [
    join(__dirname, base), // src
    join(root, base) // dest
  ]
  yield fs.copy(...paths('tendermint'), next)
  yield fs.copy(...paths('genesis.json'), next)

  // generate validator private key, save to 'root/priv_validator.json'
  let tmroot = join(root, 'tendermint')
  let child = startProcess('tendermint',
    [ 'gen_validator' ], { env: { TMROOT: tmroot } })
  let privOut = fs.createWriteStream(join(root, 'priv_validator.json'))
  child.stdout.pipe(privOut)
  yield child.on('exit', next.arg(0))
})

watt(function * (next) {
  let root = require('../root.js')
  yield createDataDir(root)
  yield startBasecoin(root, next)
  mainWindow.webContents.send('basecoin-ready')
})()
