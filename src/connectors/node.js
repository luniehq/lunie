"use strict"

import Cosmos from "@lunie/cosmos-api"
import RpcWrapper from "./rpcWrapper"

export default function Connector(stargateUrl) {
  const cosmosClient = new Cosmos(stargateUrl, "no_address")
  const newRpcClient = RpcWrapper(cosmosClient)

  Object.assign(cosmosClient, newRpcClient)

  return cosmosClient
}
