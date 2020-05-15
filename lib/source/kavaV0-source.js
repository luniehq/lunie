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
}

module.exports = KavaV0API
