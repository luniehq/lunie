const Sentry = require('@sentry/node')
const database = require('../database')
const config = require('../../config')

class GlobalStore {
  constructor() {
    this.stores = []
    this.db = database
    this.globalValidators = {}

    this.storesReady = new Promise((resolve) => {
      this.resolveReady = resolve
    })
    this.storesReady.then(() => {
      console.log(`Global Store is ready`)
    })
    this.getStores().then((stores) => {
      if (stores) this.resolveRedy()
    })
  }

  async getStores() {
    const networks = await this.db(config)('').getNetworks()
    const stores = await Promise.all(
      networks.map((network) => {
        this.db(config)('').getStore(network.id)
      })
    )
    this.stores = stores
    await this.getGlobalValidators()
    return true
  }

  async getGlobalValidators() {
    // total staked assets (cross network)
    // uptime (cross network)
    const aggregatedValidators = this.stores.reduce(
      (validatorsAggregator, { validators }) => {
        if (validators.find(({ name }) => !validatorsAggregator[name])) {
          validators.forEach((validator) => {
            validatorsAggregator[validator.name] = this.globalValidatorReducer(
              validator
            )
          })
        }
        return validatorsAggregator
      },
      {}
    )
    this.globalValidators = aggregatedValidators
  }

  globalValidatorReducer(validator) {
    // TODO: calculate uptimePercentage average cross-chain
    return {
      uptimePercentage: validator.uptimePercentage
    }
  }
}

module.exports = GlobalStore
