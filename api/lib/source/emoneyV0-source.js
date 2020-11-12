const { default: BigNumber } = require('bignumber.js')
const CosmosV3API = require('./cosmosV3-source')

class EMoneyV0API extends CosmosV3API {
  setReducers() {
    this.reducers = require('../reducers/emoneyV0-reducers')
  }

  async getSignedBlockWindow() {
    const slashingParams = await this.query('/slashing/parameters')
    return slashingParams.signed_blocks_window_duration
  }

  async getAnnualProvision() {
    const response = await this.query(`supply/total`)
    const stakingChainDenom = this.network.getCoinLookup(
      this.network,
      this.network.stakingDenom,
      'viewDenom'
    ).chainDenom
    return BigNumber(
      response.find(({ denom }) => denom === stakingChainDenom).amount
    ).times(0.1) // emoney inflation is 10%
  }
}

module.exports = EMoneyV0API
