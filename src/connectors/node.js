"use strict"

import Cosmos from "@lunie/cosmos-api"
import Tendermint from "./tendermint"

export default function Connector(stargateUrl) {
  const cosmosClient = new Cosmos(stargateUrl, "no_address")
  const tendermint = Tendermint(cosmosClient)

  Object.assign(cosmosClient, {
    tendermint
  })

  return cosmosClient
}
