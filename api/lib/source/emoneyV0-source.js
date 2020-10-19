const TerraV3API = require('./terraV3-source')
const CosmosV0API = require('./cosmosV0-source')

class EMoneyV0API extends TerraV3API {
  setReducers() {
    this.reducers = require('../reducers/emoneyV0-reducers')
  }

  // Here we query for the current inflation rates for all the backed tokens
  async getTokensInflations() {
    const inflations = await this.get(`inflation/current`)
    return inflations.result.assets
  }

  // Here we query for the current total supply for all the backed tokens
  // We filter NGM tokens out
  async getTotalBackedValues() {
    let totalBackedValues = await this.get(`supply/total`)
    totalBackedValues = totalBackedValues.result.filter(
      (asset) => !asset.denom.includes(`ngm`)
    )
    const mapTotalBackedValues = async () => {
      return Promise.all(
        totalBackedValues.map((totalBackedValue) =>
          this.reducers.totalBackedValueReducer(
            totalBackedValue,
            this.fiatValuesAPI.eMoneyExchangeRates,
            this.reducers,
            this.network
          )
        )
      )
    }
    const resolvedBackedValues = await mapTotalBackedValues()
    return resolvedBackedValues
  }

  getAnnualProvision() {
    return 0
  }

  async getSignedBlockWindow() {
    const slashingParams = await this.query('/slashing/parameters')
    return slashingParams.signed_blocks_window_duration
  }

  async getValidators(height) {
    return CosmosV0API.prototype.getValidators.call(this, height)
  }

  async getExpectedReturns(validator) {
    await this.getTotalNetworkAnnualRewards()
    // Right now we are displaying only the EUR value of expected returns
    const expectedReturns = this.reducers.expectedRewardsPerToken(
      validator,
      validator.commission,
      this.totalNetworkAnnualRewards,
      this.fiatValuesAPI.eMoneyExchangeRates
    )
    return expectedReturns
  }

  async getTotalNetworkAnnualRewards() {
    await Promise.all([
      this.getTokensInflations(),
      this.getTotalBackedValues()
    ]).then(async ([inflations, totalBackedValues]) => {
      this.totalNetworkAnnualRewards = await this.reducers.getTotalNetworkAnnualRewards(
        inflations,
        totalBackedValues
      )
    })
  }
}

module.exports = EMoneyV0API
