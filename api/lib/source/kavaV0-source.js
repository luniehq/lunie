const CosmosV2API = require('./cosmosV2-source')
const BigNumber = require('bignumber.js')
const delegationEnum = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' }

class KavaV0API extends CosmosV2API {
  setReducers() {
    this.reducers = require('../reducers/kavaV0-reducers')
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
          this.store.validators[delegation.validator_address],
          delegationEnum.ACTIVE
        )
      )
  }

  async getBlockByHeightV2(blockHeight) {
    // kava-testnet has now a different block structure
    if (this.networkId === 'kava-testnet') {
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
    return CosmosV2API.prototype.getBlockByHeightV2.call(this, blockHeight)
  }
}

module.exports = KavaV0API
