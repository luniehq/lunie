'use strict'

let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = async function (nodeIP) {
  if (JSON.parse(process.env.COSMOS_UI_ONLY)) {
    return Promise.resolve({
      rpc: {
        on: () => {},
        subscribe: () => {},
        validators: () => {},
        status: () => {}
      },
      generateKey: () => ({
        key: {
          address: 'UI_ONLY_MODE'
        }
      }),
      queryAccount: () => {},
      queryNonce: () => {}
    })
  }

  const RestClient = require('cosmos-sdk')
  const RpcClient = require('tendermint')
  let rest = RestClient()
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
