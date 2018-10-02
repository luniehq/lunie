"use strict"

const RpcClient = require(`tendermint`)
const { ipcRenderer } = require(`electron`)

module.exports = function setRpcWrapper(container) {
  let rpcWrapper = {
    // RPC
    rpcInfo: {
      connecting: false,
      connected: true
    },
    rpcDisconnect() {
      if (!container.rpc) return

      console.log(`removing old websocket`)

      // ignore disconnect error
      container.rpc.removeAllListeners(`error`)
      container.rpc.on(`error`, () => {})

      container.rpc.ws.destroy()

      rpcWrapper.rpcInfo.connected = false
    },
    rpcConnect(rpcURL) {
      let rpcHost = rpcURL.startsWith(`http`) ? rpcURL.split(`//`)[1] : rpcURL

      if (container.rpc) {
        rpcWrapper.rpcDisconnect()
      }

      console.log(`init rpc with ` + rpcURL)
      let newRpc = new RpcClient(`ws://${rpcHost}`)
      rpcWrapper.rpcInfo.connected = true
      // we need to check immediately if the connection fails. later we will not be able to check this error
      newRpc.on(`error`, err => {
        console.log(`rpc error`, err)
        if (err.code === `ECONNREFUSED` || err.code === `ENETUNREACH`) {
          rpcWrapper.rpcInfo.connected = false
        }
      })

      container.rpc = newRpc
      rpcWrapper.rpcInfo.connecting = false
    },
    rpcReconnect: (alreadyConnecting = rpcWrapper.rpcInfo.connecting) => {
      if (alreadyConnecting) return
      rpcWrapper.rpcInfo.connecting = true

      console.log(`trying to reconnect`)

      ipcRenderer.send(`reconnect`)
    }
  }

  return rpcWrapper
}
