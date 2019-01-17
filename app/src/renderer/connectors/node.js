"use strict"

const RestClient = require(`./lcdClient.js`)
const RpcWrapper = require(`./rpcWrapper.js`)

module.exports = function(axios, remoteLcdURL, mocked = false) {
  let connector = {
    mocked,
    remoteLcdURL,
    // activate or deactivate the mocked lcdClient
    setup: mocked => {
      console.log(`Setting connector to state:` + (mocked ? `mocked` : `live`))
      let newRestClient = new RestClient(axios, remoteLcdURL)
      let newRpcClient = RpcWrapper(connector)
      Object.assign(connector, newRestClient, newRpcClient)
      // we can't assign class functions to an object so we need to iterate over the prototype
      Object.getOwnPropertyNames(Object.getPrototypeOf(newRestClient)).forEach(
        prop => {
          connector[prop] = newRestClient[prop]
        }
      )
    }
  }
  // TODO: eventually, get all data from light-client connection instead of RPC

  connector.setup(mocked)
  return connector
}
