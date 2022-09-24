const BlockStore = require('./stores/block-store')
const FiatValuesAPI = require('./fiatvalues-api')
const SlashingMonitor = require('./subscription/slashing')
const database = require('./database')
const config = require('../config')

function createDBInstance(networkId) {
  const networkSchemaName = networkId ? networkId.replace(/-/g, '_') : false
  return new database(config)(networkSchemaName)
}

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
    this.db = createDBInstance(network.id)
    this.requireSourceClass()
    this.requireSubscriptionClass()

    if (network.network_type === 'cosmos')
      this.slashingMonitor = new SlashingMonitor(
        network,
        this.createDataSource()
      )
  }

  initialize() {
    this.createStore()
    this.createFiatValuesAPI()
    this.createBlockListener()

    if (this.network.network_type === 'cosmos')
      this.slashingMonitor.initialize()
  }

  createStore() {
    this.store = new BlockStore(this.network, this.db)
  }

  createFiatValuesAPI() {
    this.fiatValuesAPI = new FiatValuesAPI()
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
        api: new this.sourceClass(
          this.network,
          this.store,
          this.fiatValuesAPI,
          this.db
        ),
        store: this.store
      }
    }
  }

  createBlockListener() {
    if (this.subscriptionClass) {
      this.blockListener = new this.subscriptionClass(
        this.network,
        this.sourceClass,
        this.store,
        this.fiatValuesAPI,
        this.db
      )
    }
  }
}

module.exports = NetworkContainer
