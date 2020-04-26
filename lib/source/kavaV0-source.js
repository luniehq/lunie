const CosmosV2API = require('./cosmosV2-source')

const gasPrices = [
  {
    denom: 'ukava',
    price: '0.01'
  }
]

class KavaV0API extends CosmosV2API {
  setReducers() {
    this.reducers = require('../reducers/cosmosV2-reducers')
    this.gasPrices = gasPrices
  }
}

module.exports = KavaV0API
