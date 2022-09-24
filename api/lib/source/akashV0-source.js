const TerraV3API = require('./terraV3-source')
const CosmosV0API = require('./cosmosV0-source')
const BigNumber = require('bignumber.js')
const delegationEnum = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' }

class AkashV0API extends TerraV3API {
  setReducers() {
    this.reducers = require('../reducers/akashV0-reducers')
  }

  async getValidators(height) {
    return CosmosV0API.prototype.getValidators.call(this, height)
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

  async getDelegationsForDelegatorAddress(address) {
    this.checkAddress(address)
    let delegations =
      (await this.query(`staking/delegators/${address}/delegations`)) || []

    return delegations
      .filter((delegation) =>
        BigNumber(delegation.balance.amount).isGreaterThanOrEqualTo(1)
      )
      .map((delegation) =>
        this.reducers.delegationReducer(
          delegation,
          this.store.validators[delegation.validator_address]
        )
      )
  }
}

module.exports = AkashV0API
