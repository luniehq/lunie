'use strict'

const Basecoin = require('basecoin')
const watt = require('watt')

// import { ipcRenderer } from 'electron'
// yield ipcRenderer.once('basecoin-ready', next.arg(0))

module.exports = watt(function * (next) {
  return Basecoin('ws://localhost:46657')
  // TODO: wallet management
})
