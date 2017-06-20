'use strict'

const Basecoin = require('basecoin')
const watt = require('watt')

const LIGHT = process.env.BASECOIN_LIGHT_CLIENT != null
const RPC_URI = `ws://localhost:${LIGHT ? 8888 : 46657}`

module.exports = watt(function * (next) {
  let client
  while (true) {
    try {
      client = Basecoin(RPC_URI)
      client.once('error', next)
      yield client.rpc.status(next)
      console.log('connected to basecoin RPC')
      client.removeListener('error', next)
      break
    } catch (err) {
      console.log('waiting for basecoin RPC')
      yield setTimeout(next, 1000) // wait 1s
    }
  }

  return { client }
})
