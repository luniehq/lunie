'use strict'

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs-extra')
const { app, BrowserWindow } = require('electron')
const home = require('user-home')
const mkdirp = require('mkdirp')
const pkg = require('./package.json')

let mainWindow
let config = {}

const DEV = process.env.NODE_ENV === 'development'
if (DEV) {
  config = require('../config')
  config.url = `http://localhost:${config.port}`
} else {
  config.devtron = false
  config.url = `file://${__dirname}/dist/index.html`
}

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800
  })

  mainWindow.loadURL(config.url)

  if (process.env.NODE_ENV === 'development') {
    BrowserWindow.addDevToolsExtension(path.join(__dirname, '../node_modules/devtron'))

    let installExtension = require('electron-devtools-installer')

    installExtension.default(installExtension.VUEJS_DEVTOOLS)
      .then((name) => mainWindow.webContents.openDevTools())
      .catch((err) => console.log('An error occurred: ', err))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  console.log('mainWindow opened')
}

function startProcess (name, ...args) {
  let binPath
  if (process.env.NODE_ENV === 'development') {
    let GOPATH = process.env.GOPATH
    if (!GOPATH) GOPATH = path.join(home, 'go')
    binPath = path.join(GOPATH, 'bin', name)
  } else {
    binPath = path.join(__dirname, 'bin', name)
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
function startBasecoin (root) {
  let tmroot = path.join(root, 'tendermint')
  return startProcess('basecoin', [
    'start',
    '--in-proc',
    `--dir=${root}`
  ], { env: { TMROOT: tmroot } })
}

function createDataDir (root, cb) {
  fs.access(root, (err) => {
    if (err && err.code !== 'ENOENT') return cb(err)
    if (!err) return cb(null)
    mkdirp(root, (err) => {
      if (err) return cb(err)
      let paths = (base) => [
        path.join(__dirname, base), // src
        path.join(root, base) // dest
      ]
      fs.copy(...paths('tendermint'), (err) => {
        if (err) return cb(err)
        fs.copy(...paths('genesis.json'), cb)
      })
    })
  })
}

let root = path.join(home, `.${pkg.name}${DEV ? '-dev' : ''}`)
createDataDir(root, (err) => {
  if (err) throw err
  startBasecoin(root)
})
