const TerraV3API = require('./terraV3-source')

// This is just a dummy value.
// It is kind of difficult to calculate the expected returns for e-Money since it is
// planned that the issuance of the fiat-backed tokens varies within one same year.
const totalBackedValueEUR = '100000'
// E-Money has a fixed inflation of 1% for fiat-backed tokens
const inflation = 0.01

class EMoneyV0API extends TerraV3API {
  setReducers() {
    this.reducers = require('../reducers/emoneyV0-reducers')
  }

  async getExpectedReturns(validator) {
    // Right now we are displaying only the EUR value of expected returns
    const expectedReturns = this.reducers.expectedRewardsPerToken(
      validator,
      validator.commission,
      inflation,
      totalBackedValueEUR
    )
    return expectedReturns
  }
}

module.exports = EMoneyV0API
