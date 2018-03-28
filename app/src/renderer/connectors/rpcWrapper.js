const RpcClient = require('tendermint')
const { ipcRenderer } = require('electron')

module.exports = function setRpcWrapper (container, nodeIP) {
  let rpcWrapper = {
    // RPC
    rpcInfo: {
      nodeIP,
      connecting: false,
      connected: true
    },
    rpcConnect (nodeIP) {
      rpcWrapper.rpcInfo.nodeIP = nodeIP

      if (container.rpc) {
        console.log('removing old websocket')

        // ignore disconnect error
        container.rpc.removeAllListeners('error')
        container.rpc.on('error', () => { })

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
    rpcReconnect: (alreadyConnecting = rpcWrapper.rpcInfo.connecting) => {
      if (alreadyConnecting) return
      rpcWrapper.rpcInfo.connecting = true

      console.log('trying to reconnect')

      ipcRenderer.send('reconnect')
    }
  }

  return rpcWrapper
}
