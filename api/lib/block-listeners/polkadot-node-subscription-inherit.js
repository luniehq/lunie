const { ApiPromise, WsProvider } = require('@polkadot/api')
const BaseNodeSubscription = require('./base-node-subscription')


// This class polls for new blocks
// Used for listening to events, such as new blocks.
class PolkadotNodeSubscription extends BaseNodeSubscription {
  constructor(network, PolkadotDataSourceClass, store) {
    super(network, PolkadotDataSourceClass, store)
  }

  async setup(network, PolkadotDataSourceClass, store) {
    await this.initPolkadotRPC(network, store)
  }

  // here we init the polkadot rpc once for all processes
  // the class gets stored in the store to be used by all instances
  async initPolkadotRPC(network, store) {
    const api = new ApiPromise({
      provider: new WsProvider(
        network.rpc_url || thisnetwork.public_rpc_url
      )
    })
    store.polkadotRPC = api
    store.polkadotRPCOpened = Date.now()
    await api.isReady
    console.log(network.id + ' API initialized')
  }
}

module.exports = PolkadotNodeSubscription
