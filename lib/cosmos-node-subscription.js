const Tendermint = require('./helpers/tendermint')
const {
  publishBlockAdded,
  publishUserTransactionAdded
} = require('./subscriptions')

// This class establishes an rpc connection to Tendermint.
// Used for listening to events, such as new blocks.
class CosmosNodeSubscription {
  constructor(network, CosmosApiClass) {
    this.network = network
    this.cosmosAPI = new CosmosApiClass(network)

    // Create a RPC subscription for each network that will react to new block events.
    Tendermint().connect(this.network.rpc_url).then(connectedClient => {
      connectedClient.subscribe({ query: "tm.event='NewBlock'" }, event =>
        this.blockSubscriptionHandler(event)
      )
    })
  }

  // For each block event, we fetch the block information and publish a message.
  // A GraphQL resolver is listening for these messages and sends the block to
  // each subscribed user.
  async blockSubscriptionHandler(event) {
    const height = event.block.header.height
    const block = await this.cosmosAPI.getBlockByHeight({
      blockHeight: height
    })
    publishBlockAdded(this.network.id, block)

    // For each transaction listed in a block we fetch the transaction and
    // extract the relevant addresses. This is published to the network.
    // A GraphQL resolver is listening for these messages and sends the
    // transaction to each subscribed user.
    const txs = await this.cosmosAPI.getTransactionsByHeight(height)
    txs.forEach(tx => {
      this.cosmosAPI.extractInvolvedAddresses(tx.raw).forEach(address => {
        publishUserTransactionAdded(this.network.id, address, tx)
      })
    })

    this.cosmosAPI.clearMemory()
  }
}

module.exports = CosmosNodeSubscription
