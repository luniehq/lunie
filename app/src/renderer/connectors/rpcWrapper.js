const RpcClient = require('tendermint')
const axios = require('axios')

module.exports = function setRpcWrapper (container, nodeIP, relayServerAddress) {
  let rpcWrapper = {
    // RPC
    rpcInfo: {
      nodeIP,
      connecting: false,
      connected: true
    },
    initRPC (nodeIP) {
      if (container.rpc) {
        console.log('removing old websocket')

        // ignore disconnect error
        container.rpc.removeAllListeners('error')
        container.rpc.on('error', () => {})

        container.rpc.ws.destroy()
      }

      console.log('init rpc with', nodeIP)
      let newRpc = new RpcClient(`ws://${nodeIP}`)
      rpcWrapper.rpcInfo.connected = true
      // we need to check immediately if he connection fails. later we will not be able to check this error
      newRpc.on('error', err => {
        console.log('rpc error', err)
        if (err.code === 'ECONNREFUSED' || err.code === 'ENETUNREACH') {
          rpcWrapper.rpcInfo.connected = false
        }
      })

      container.rpc = newRpc
    },
    rpcReconnect: async (alreadyConnecting = rpcWrapper.rpcInfo.connecting) => {
      if (alreadyConnecting) return null
      rpcWrapper.rpcInfo.connecting = true

      console.log('trying to reconnect')

      let nodeIP = (await axios(relayServerAddress + '/reconnect')).data
      if (nodeIP) {
        console.log('Reconnected to', nodeIP)
        rpcWrapper.rpcInfo.nodeIP = nodeIP
        rpcWrapper.initRPC(nodeIP)
      } else {
        console.log('Reconnection failed, trying again')
        // try again in 3s
        await sleep(3000)
        return rpcWrapper.rpcReconnect(false)
      }

      rpcWrapper.rpcInfo.connecting = false
      return nodeIP
    }
  }
}

function sleep (ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
