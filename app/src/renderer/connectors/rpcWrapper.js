"use strict"

const { RpcClient } = require(`tendermint`)

module.exports = function setRpcWrapper(container) {
  let rpcWrapper = {
    // RPC
    rpcInfo: {
      connecting: false,
      connected: true
    },
    rpcDisconnect() {
      if (!container.rpc || !container.rpc.ws) return

      console.log(`removing old websocket`)

      // ignore disconnect error
      container.rpc.removeAllListeners(`error`)
      container.rpc.on(`error`, () => {})

      container.rpc.ws.destroy()

      rpcWrapper.rpcInfo.connected = false
    },
    async rpcConnect(rpcURL) {
      let rpcHost =
        rpcURL.startsWith(`http`) && rpcURL.indexOf(`//`) !== -1
          ? rpcURL.split(`//`)[1]
          : rpcURL

      let https = rpcURL.startsWith(`https`)

      if (container.rpc) {
        rpcWrapper.rpcDisconnect()
      }

      console.log(`init rpc with ` + rpcURL)
      let newRpc = new RpcClient(`${https ? `wss` : `ws`}://${rpcHost}`)
      rpcWrapper.rpcInfo.connected = true
      // we need to check immediately if the connection fails. later we will not be able to check this error

      const connectionAttempt = await Promise.race([
        new Promise(resolve => {
          newRpc.on(`error`, err => {
            resolve({ error: err })
          })
        }),
        newRpc.health()
      ])
      rpcWrapper.rpcInfo.connecting = false

      if (connectionAttempt.error) {
        rpcWrapper.rpcInfo.connected = false
        throw new Error(`WS connection failed`)
      }

      container.rpc = newRpc
    }
  }

  return rpcWrapper
}
