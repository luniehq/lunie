const BaseNodeSubscription = require('./base-node-subscription')


// This class polls for new blocks
// Used for listening to events, such as new blocks.
class CosmosNodeSubscription extends BaseNodeSubscription {
  constructor(network, CosmosDataSourceClass, store) {
    super(network, CosmosDataSourceClass, store)
  }
}

module.exports = CosmosNodeSubscription