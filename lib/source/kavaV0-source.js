const CosmosV2API = require('./cosmosV2-source')

class KavaV0API extends CosmosV2API {
  setReducers() {
    this.reducers = require('../reducers/kavaV0-reducers')
  }
}

module.exports = KavaV0API
