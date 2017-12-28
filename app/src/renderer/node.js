'use strict'

const DEV = process.env.NODE_ENV === 'development'

module.exports = async function (nodeIP) {
  if (JSON.parse(process.env.COSMOS_UI_ONLY || 'false')) {
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

  let rest = RestClient('http://localhost:8999')
  let rpc = RpcClient(`ws://${nodeIP}`)
  // TODO: handle disconnect, try to reconnect
  // TODO: eventually, get all data from light-client connection instead of RPC

  rest.rpc = rpc
  rest.nodeIP = nodeIP
  rest.reconnect = () => fetch('http://localhost:8999/reconnect')
  return rest
}
