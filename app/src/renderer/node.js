'use strict'
const RpcClient = require('tendermint')
const RestClient = require('cosmos-sdk')

const RELAY_SERVER = 'http://localhost:8999'

module.exports = async function (nodeIP) {
  if (JSON.parse(process.env.COSMOS_UI_ONLY || 'false')) {
    return mockClient()
  }

  let node = new RestClient(RELAY_SERVER)

  Object.assign(node, {
    lcdConnected: () => node.listKeys()
      .then(() => true, () => false),

    // RPC
    rpcConnecting: false,
    rpcOpen: true,
    initRPC (nodeIP) {
      if (node.rpc) {
        node.rpc.ws.destroy()
      }

      console.log('init rpc with', nodeIP)
      let newRpc = new RpcClient(`ws://${nodeIP}`)
      node.rpcOpen = true
      // we need to check immediately if he connection fails. later we will not be able to check this error
      newRpc.on('error', err => {
        console.log('rpc error', err)
        if (err.code === 'ECONNREFUSED') {
          node.rpcOpen = false
        }
      })

      node.rpc = newRpc
    },
    rpcReconnect: async (rpcConnecting = node.rpcConnecting) => {
      if (rpcConnecting) return
      node.rpcConnecting = true

      console.log('trying to reconnect')

      let nodeIP = await fetch(RELAY_SERVER + '/reconnect').then(res => res.text())
      console.log('Reconnected to', nodeIP)
      if (nodeIP) {
        node.initRPC(nodeIP)
      } else {
        // try again in 3s
        await sleep(3000)
        return node.rpcReconnect(false)
      }

      node.rpcConnecting = false
      return nodeIP
    }
  })
  // TODO: eventually, get all data from light-client connection instead of RPC

  node.initRPC(nodeIP)
  return node
}

function mockClient () {
  return {
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
  }
}

function sleep (ms = 0) {
  return new Promise(r => setTimeout(r, ms))
}
