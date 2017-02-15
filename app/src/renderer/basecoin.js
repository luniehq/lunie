'use strict'

const { join } = require('path')
const Basecoin = require('basecoin')
const watt = require('watt')
const root = require('../root.js')

module.exports = watt(function * (next) {
  let client = Basecoin('ws://localhost:46657')
  let walletPath = join(root, 'wallet.db')
  let wallet = yield client.wallet(walletPath, next)
  return { client, wallet }
})
