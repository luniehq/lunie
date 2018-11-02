"use strict"

const { ipcRenderer } = require(`electron`)
const RestClient = require(`./lcdClient.js`)
const mockedRestClient = require(`./lcdClientMock.js`)
const RpcWrapper = require(`./rpcWrapper.js`)
const MockedRpcWrapper = require(`./rpcWrapperMock.js`)

// Proxy requests to Axios through the main process because we need
// Node.js in order to support self-signed TLS certificates.
const AxiosProxy = () => {
  let requestCounter = 0

  return options =>
    new Promise((resolve, reject) => {
      requestCounter++

      if (requestCounter === Number.MAX_SAFE_INTEGER) {
        requestCounter = 0
      }

      const channel = `Axios/${requestCounter}`

      ipcRenderer.once(channel, (event, { exception, value }) => {
        ipcRenderer.removeAllListeners(channel)

        if (exception) {
          reject(exception)
        } else {
          resolve(value)
        }
      })

      ipcRenderer.send(`Axios`, requestCounter, options)
    })
}

module.exports = function(localLcdURL, remoteLcdURL, mocked = false) {
  let connector = {
    mocked,
    localLcdURL,
    remoteLcdURL,
    // activate or deactivate the mocked lcdClient
    setup: mocked => {
      console.log(`Setting connector to state:` + (mocked ? `mocked` : `live`))
      let newRestClient = mocked
        ? mockedRestClient
        : new RestClient(AxiosProxy(), localLcdURL, remoteLcdURL)
      let newRpcClient = mocked
        ? MockedRpcWrapper(connector)
        : RpcWrapper(connector)
      Object.assign(connector, newRestClient, newRpcClient)
      // we can't assign class functions to an object so we need to iterate over the prototype
      if (!mocked) {
        Object.getOwnPropertyNames(
          Object.getPrototypeOf(newRestClient)
        ).forEach(prop => {
          connector[prop] = newRestClient[prop]
        })
      }
    }
  }
  // TODO: eventually, get all data from light-client connection instead of RPC

  connector.setup(mocked)
  return connector
}
