const BaseNodeSubscription = require('./base-node-subscription')

// apparently the cosmos db takes a while to serve the content after a block has been updated
// if we don't do this, we run into errors as the data is not yet available
const COSMOS_DB_DELAY = 2000

// This class polls for new blocks
// Used for listening to events, such as new blocks.
class CosmosNodeSubscription extends BaseNodeSubscription {
  constructor(network, CosmosDataSourceClass, store, fiatValuesAPI) {
    super(network, CosmosDataSourceClass, store, fiatValuesAPI)
  }

  newBlockHandler(currentBlock, dataSource) {
    setTimeout(
      () =>
        BaseNodeSubscription.prototype.newBlockHandler.call(
          this,
          currentBlock,
          dataSource
        ),
      COSMOS_DB_DELAY
    )
  }
}

module.exports = CosmosNodeSubscription
