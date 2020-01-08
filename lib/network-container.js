const BlockStore = require('./block-store')

/*
  This class handles creation and management of each network.
  Given a network config object it will establish the block listeners,
  the store. It will also set the API object for the createDataSource()
  method used by Apollo.
*/
class NetworkContainer {
  constructor(network) {
    this.network = network
    this.id = network.id
    this.requireSourceClass()
    this.requireSubscriptionClass()
  }

  initialize() {
    this.createStore()
    this.createBlockListener()
  }

  createStore() {
    this.store = new BlockStore(this.network)
  }

  requireSourceClass() {
    if (
      typeof this.network.source_class_name === 'string' &&
      this.network.source_class_name !== ''
    ) {
      this.sourceClass = require(`./${this.network.source_class_name}`)
    }
  }

  requireSubscriptionClass() {
    if (
      typeof this.network.block_listener_class_name === 'string' &&
      this.network.block_listener_class_name !== ''
    ) {
      this.subscriptionClass = require(`./${this.network.block_listener_class_name}`)
    }
  }

  createDataSource() {
    if (this.sourceClass) {
      return {
        api: new this.sourceClass(this.network),
        store: this.store
      }
    }
  }

  createBlockListener() {
    if (this.subscriptionClass) {
      this.blockListener = new this.subscriptionClass(
        this.network,
        this.sourceClass,
        this.store
      )
    }
  }
}

module.exports = NetworkContainer
