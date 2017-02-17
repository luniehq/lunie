'use strict'

const { join } = require('path')
const Basecoin = require('basecoin')
const watt = require('watt')
const root = require('../root.js')

const { ipcRenderer } = require('electron')

const RPC_URI = 'ws://localhost:46657'

module.exports = watt(function * (next) {
  try {
    var client = Basecoin(RPC_URI)
    yield client.rpc.status(next)
  } catch (err) {
    yield ipcRenderer.once('basecoin-ready', next.arg(0))
    console.log('basecoin ready')
    client = Basecoin(RPC_URI)
  }

  // TODO: wallet management
  let walletPath = join(root, 'wallet.db')
  let wallet = yield client.wallet(walletPath)
  console.log(wallet.accounts[0].key.address().toString('hex'))

  let wallets = { default: wallet }

  return { client, wallets }
})
