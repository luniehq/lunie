"use strict"

import RpcClient from "./tendermint-ws.js"

export default function setRpcWrapper(container) {
  const rpcWrapper = {
    rpcInfo: {
      connecting: false,
      connected: true
    },
    rpcDisconnect() {
      rpcDisconnect(container.rpc)
      rpcWrapper.rpcInfo.connected = false
    },
    async rpcConnect(rpcURL) {
      // if we have an existing connection, first disconnect that one
      if (container.rpc) {
        rpcDisconnect(container.rpc)
        rpcWrapper.rpcInfo.connected = false
      }

      const newRpc = await rpcConnect(rpcURL).catch(err => {
        rpcWrapper.rpcInfo.connected = false
        throw err
      })
      container.rpc = newRpc
      rpcWrapper.rpcInfo.connected = true
    }
  }

  return rpcWrapper
}

function rpcDisconnect(rpc) {
  if (!rpc || !rpc.ws) return

  console.log(`removing old websocket`)

  // ignore disconnect error
  rpc.removeAllListeners(`error`)
  rpc.on(`error`, () => {})

  rpc.ws.destroy()
}

async function rpcConnect(rpcURL) {
  const rpcHost = getHost(rpcURL)
  const https = rpcURL.startsWith(`https`)

  console.log(`init rpc with ` + rpcURL)
  const newRpc = RpcClient(`${https ? `wss` : `ws`}://${rpcHost}`)

  // we need to check immediately if the connection fails. later we will not be able to check this error
  const connected = await checkConnection(newRpc)

  if (!connected) {
    throw new Error(`WS connection failed`)
  }

  return newRpc
}

function getHost(url) {
  return url.startsWith(`http`) && url.indexOf(`//`) !== -1
    ? url.split(`//`)[1]
    : url
}

// check if the rpc connection was established
async function checkConnection(rpc) {
  const connectionAttempt = await Promise.race([
    new Promise(resolve => {
      rpc.on(`error`, err => {
        resolve({ error: err })
      })
    }),
    rpc.health()
  ])

  return !connectionAttempt.error
}
