'use strict'
const RpcClient = require('tendermint')
const RestClient = require('cosmos-sdk')
const axios = require('axios')

const RELAY_SERVER = 'http://localhost:8999'

module.exports = function (nodeIP) {
  if (JSON.parse(process.env.COSMOS_UI_ONLY || 'false')) {
    return mockClient()
  }

  let node = new RestClient(RELAY_SERVER)

  Object.assign(node, {
    nodeIP,
    lcdConnected: () => node.listKeys()
      .then(() => true, () => false),

    // RPC
    rpcConnecting: false,
    rpcOpen: true,
    initRPC (nodeIP) {
      if (node.rpc) {
        console.log('removing old websocket')

        // ignore disconnect error
        node.rpc.removeAllListeners('error')
        node.rpc.on('error', () => {})

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
    rpcReconnect: async (alreadyConnecting = node.rpcConnecting) => {
      if (alreadyConnecting) return null
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
    },
    async sendTx (args, account, password) {
      let tx = await (async function () {
        switch (args.type) {
          case 'buildDelegate': return axios.post('http://localhost:8998/build/stake/delegate', args)
            .then(res => res.data)
          case 'buildUnbond': return axios.post('http://localhost:8998/build/stake/unbond', args)
            .then(res => res.data)
          default: return node[args.type](args)
        }
      })()
      let signedTx = await node.sign({
        name: account,
        password: password,
        tx
      })
      let res = await node.postTx(signedTx)
      // check response code
      if (res.check_tx.code || res.deliver_tx.code) {
        let message = res.check_tx.log || res.deliver_tx.log
        throw new Error('Error sending transaction: ' + message)
      }
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
  return new Promise((resolve) => setTimeout(resolve, ms))
}
