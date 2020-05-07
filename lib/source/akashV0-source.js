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
}

module.exports = AkashV0API
