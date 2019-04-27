"use strict"

import RestClient from "./api.js"
import RpcWrapper from "./rpcWrapper.js"

export default function(axios, stargateUrl, mocked = false) {
  const connector = {
    mocked,
    remoteLcdURL: stargateUrl,
    // activate or deactivate the mocked lcdClient
    setup: mocked => {
      console.log(`Setting connector to state:` + (mocked ? `mocked` : `live`))
      const newRestClient = new RestClient(axios, stargateUrl)
      const newRpcClient = RpcWrapper(connector)
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
