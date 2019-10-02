const { PubSub } = require("apollo-server");
const pubsub = new PubSub();
let { RpcClient } = require("tendermint");
const config = require("../config");

// TODO Factor cosmos-api out of this file
const CosmosAPI = require("./cosmos-source");
var cosmosAPI = new CosmosAPI(config.chain_url);

let client = RpcClient(config.chain_ws_url);

const BLOCK_ADDED = "BLOCK_ADDED";

client.subscribe({ query: "tm.event='NewBlock'" }, async event => {
  const block = await cosmosAPI.getBlockByHeight({
    blockHeight: event.block.header.height
  });

  pubsub.publish(BLOCK_ADDED, { blockAdded: block });
});

module.exports = {
  blockAdded: () => pubsub.asyncIterator([BLOCK_ADDED])
};
