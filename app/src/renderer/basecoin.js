'use strict'

const { join } = require('path')
const { readdir, stat } = require('fs')
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

  let walletsPath = join(root, 'wallets')

  const createWallet = watt(function * (id, next) {
    let path = join(walletsPath, `${id}.db`)
    return yield client.wallet(path)
  })

  const loadWallets = watt(function * (next) {
    let walletNames = yield readdir(walletsPath, next)

    let walletStats = []
    for (let name of walletNames) {
      let stats = yield stat(join(walletsPath, name), next)
      walletStats.push({
        name,
        time: new Date(stats.birthtime || stats.ctime)
      })
    }
    walletStats.sort((a, b) => a.time - b.time)

    let wallets = {}
    for (let { name } of walletStats) {
      let path = join(walletsPath, name)
      let id = name.slice(0, -3)
      wallets[id] = yield client.wallet(path)
    }
    return wallets
  })

  const wallet = watt(function * (next) {
    let id = Math.random().toString(16).slice(2, 10).toUpperCase()
    let wallet = yield createWallet(id)
    wallets[id] = wallet
    return { id, wallet }
  })

  let wallets = {}
  let exists = (yield readdir(walletsPath, next)).length > 0
  if (exists) {
    wallets = yield loadWallets()
    console.log('loaded wallets')
  } else {
    wallets.default = yield createWallet('default')
    console.log('created default wallet')
  }

  return { client, wallets, wallet }
})
