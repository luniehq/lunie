"use strict"
const RestClient = require("./lcdClient.js")
const mockedRestClient = require("./lcdClientMock.js")
const RpcWrapper = require("./rpcWrapper.js")
const MockedRpcWrapper = require("./rpcWrapperMock.js")

module.exports = function(lcdPort, mocked = false) {
  const LCD_SERVER = "http://localhost:" + lcdPort

  let connector = {
    lcdPort,
    // activate or deactivate the mocked lcdClient
    setup: mocked => {
      console.log("Setting connector to state:", mocked ? "mocked" : "live")
      let newRestClient = mocked ? mockedRestClient : new RestClient(LCD_SERVER)
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
