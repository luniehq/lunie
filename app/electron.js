'use strict'

const { spawn } = require('child_process')
const path = require('path')
const { app, BrowserWindow } = require('electron')

let mainWindow
let config = {}

if (process.env.NODE_ENV === 'development') {
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
    binPath = name
  } else {
    binPath = path.join(__dirname, 'bin', name)
  }

  let child = spawn(binPath, ...args)
  child.stdout.on('data', (data) => console.log(`${name}: ${data}`))
  child.stderr.on('data', (data) => console.log(`${name}: ${data}`))
  return child
}

function startTendermintProcesses () {
  // basecoin server
  let basecoin = startProcess('basecoin', [
    `--genesis=${path.join(__dirname, 'genesis.json')}`
  ])

  // tendermint node
  let tendermint = startProcess('tendermint', [
    'node'
    // TODO: set TMPATH
  ])

  // light-client verifier
  let verifier = startProcess('verifier', [
    `--socket=${path.join(__dirname, 'verifier.sock')}`
  ])
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

startTendermintProcesses()
