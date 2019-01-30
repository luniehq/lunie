"use strict"

const RestClient = require(`./lcdClient.js`)
const mockedRestClient = require(`./lcdClientMock.js`)
const RpcWrapper = require(`./rpcWrapper.js`)
const MockedRpcWrapper = require(`./rpcWrapperMock.js`)

module.exports = function(axios, stargateUrl, mocked = false) {
  const connector = {
    mocked,
    remoteLcdURL: stargateUrl,
    // activate or deactivate the mocked lcdClient
    setup: mocked => {
      console.log(`Setting connector to state:` + (mocked ? `mocked` : `live`))
      const newRestClient = mocked
        ? mockedRestClient
        : new RestClient(axios, stargateUrl)
      const newRpcClient = mocked
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
