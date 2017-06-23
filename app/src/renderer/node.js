'use strict'

const { join } = require('path')
const Basecoin = require('basecoin')
const DelegationGame = require('cosmos-delegation-game')
const watt = require('watt')
const root = require('../root.js')

const LIGHT = process.env.BASECOIN_LIGHT_CLIENT != null
const RPC_URI = `ws://localhost:${LIGHT ? 8888 : 46657}`

module.exports = watt(function * (next) {
  let basecoin
  while (true) {
    try {
      basecoin = Basecoin(RPC_URI)
      basecoin.once('error', next)
      yield basecoin.rpc.status(next)
      console.log('connected to gaia RPC')
      basecoin.removeListener('error', next)
      break
    } catch (err) {
      console.log('waiting for gaia RPC')
      yield setTimeout(next, 1000) // wait 1s
    }
  }
  let { rpc } = basecoin
  let delegationGame = DelegationGame(RPC_URI)

  let walletPath = join(root, 'wallet.db')
  let wallet = yield basecoin.wallet(walletPath)

  return { rpc, basecoin, delegationGame, wallet }
})
