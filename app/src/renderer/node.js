'use strict'

const RestClient = require('cosmos-sdk')
const RpcClient = require('tendermint')

let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = async function (nodeIP) {
  // TODO: once we're done with the mock API server, switch this from port 8999 to 8998
  let rest = RestClient('http://localhost:8999')
  let rpc = RpcClient(`ws://${nodeIP}`)
  // TODO: handle disconnect, try to reconnect
  // TODO: eventually, get all data from light-client connection instead of RPC

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
  rest.nodeIP = nodeIP
  return rest
}
