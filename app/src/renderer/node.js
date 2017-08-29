'use strict'

const RestClient = require('cosmos-sdk')
const RpcClient = require('tendermint')

let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = async function () {
  let rest = RestClient()
  let rpc = RpcClient()

  // poll server until it is online
  while (true) {
    try {
      await rest.listKeys()
      break
    } catch (err) {
      console.log('waiting for baseserver', err)
    }
    await sleep(1000)
  }

  rest.rpc = rpc
  return rest
}
