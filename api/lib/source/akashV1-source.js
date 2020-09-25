const CosmosV3API = require('./cosmosV3-source')

class AkashV1API extends CosmosV3API {
  setReducers() {
    this.reducers = require('../reducers/akashV1-reducers')
  }
}

module.exports = AkashV1API
