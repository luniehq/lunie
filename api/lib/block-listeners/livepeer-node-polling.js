const _ = require('lodash')

// This class establishes an rpc connection to Tendermint.
// Used for listening to events, such as new blocks.
class LivepeerNodePolling {
  constructor(network, ApiSourceClass, store) {
    this.network = network
    this.sourceAPI = new ApiSourceClass(network)
    this.store = store

    this.newBlockHandler()
    setInterval(() => this.newBlockHandler(), 10 * 1000)
  }

  // For each block event, we fetch the block information and publish a message.
  // A GraphQL resolver is listening for these messages and sends the block to
  // each subscribed user.
  async newBlockHandler() {
    const transcoders = await this.sourceAPI.getAllValidators()
    const lastBlockHeight = await this.sourceAPI.getLastBlockHeight()
    const validatorMap = _.keyBy(transcoders, 'operatorAddress')
    this.store.update({ validators: validatorMap, height: lastBlockHeight })
  }
}

module.exports = LivepeerNodePolling
