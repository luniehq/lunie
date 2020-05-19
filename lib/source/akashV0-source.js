const TerraV3API = require('./terraV3-source')
const CosmosV0API = require('./cosmosV0-source')

class AkashV0API extends TerraV3API {
  setReducers() {
    this.reducers = require('../reducers/akashV0-reducers')
  }

  async getAllValidators(height) {
    return CosmosV0API.prototype.getAllValidators.call(this, height)
  }

  async getExpectedReturns(validator) {
    return CosmosV0API.prototype.getExpectedReturns.call(this, validator)
  }

  async getBlockByHeightV2(blockHeight) {
    let block, transactions
    if (blockHeight) {
      const response = await Promise.all([
        this.getRetry(`blocks/${blockHeight}`),
        this.getTransactionsV2ByHeight(blockHeight)
      ])
      block = response[0]
      transactions = response[1]
    } else {
      block = await this.getRetry(`blocks/latest`)
      transactions = await this.getTransactionsV2ByHeight(
        block.block.header.height
      )
    }
    return this.reducers.blockReducer(this.network.id, block, transactions)
  }
}

module.exports = AkashV0API
