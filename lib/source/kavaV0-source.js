const CosmosV2API = require('./cosmosV2-source')

const gasPrices = [
  {
    denom: 'ukava',
    price: '0.1' // TODO: this cannot be. In bigdipper I see transaction going through paying much less
  }
]

class KavaV0API extends CosmosV2API {
  setReducers() {
    this.reducers = require('../reducers/kavaV0-reducers')
    this.gasPrices = gasPrices
  }
}

module.exports = KavaV0API
