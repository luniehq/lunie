'use strict'
const { ipcRenderer } = require('electron')
const RpcClient = require('tendermint')
const RestClient = require('./lcdClient.js')

module.exports = function (nodeIP, relayPort, lcdPort) {
  const RELAY_SERVER = 'http://localhost:' + relayPort

  let node = new RestClient(RELAY_SERVER)

  Object.assign(node, {
    nodeIP,
    relayPort,
    lcdPort,
    lcdConnected: () => node.listKeys()
      .then(() => true, () => false),

    // RPC
    rpcConnecting: false,
    rpcOpen: true,
    rpcConnect (nodeIP) {
      node.nodeIP = nodeIP

      if (node.rpc) {
        console.log('removing old websocket')

        // ignore disconnect error
        node.rpc.removeAllListeners('error')
        node.rpc.on('error', () => { })

        node.rpc.ws.destroy()
      }

      console.log('init rpc with', nodeIP)
      let newRpc = new RpcClient(`ws://${nodeIP}`)
      node.rpcOpen = true
      // we need to check immediately if he connection fails. later we will not be able to check this error
      newRpc.on('error', err => {
        console.log('rpc error', err)
        if (err.code === 'ECONNREFUSED' || err.code === 'ENETUNREACH') {
          node.rpcOpen = false
        }
      })

      node.rpc = newRpc
    },
    rpcReconnect: () => {
      ipcRenderer.send('reconnect')
    }
  })
  // TODO: eventually, get all data from light-client connection instead of RPC

  // node.rpcConnect(nodeIP)
  return node
}
