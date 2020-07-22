const Sentry = require('@sentry/node')
const config = require('../../config')

class GlobalStore {
  constructor(database) {
    this.stores = []
    this.db = database
    this.globalValidators = {}

    this.dataReady = new Promise((resolve) => {
      this.resolveReady = resolve
    })
    this.dataReady.then(() => {
      console.log(`Global Store is ready`)
    })
    this.getStores().then((stores) => {
      if (stores) this.resolveRedy()
    })
  }

  async getStores() {
    const networks = await this.db.getNetworks()
    if (networks.length !== this.stores.length) {
      setTimeout(async () => await this.getStores(), 1000)
    } else {
      await this.getGlobalValidators()
      return true
    }
  }

  async getGlobalValidators() {
    const aggregatedValidators = this.stores
      .map(({ store }) => JSON.parse(store))
      .reduce((validatorsAggregator, { validators }) => {
        if (validators.find(({ name }) => !validatorsAggregator[name])) {
          validators.forEach((validator) => {
            validatorsAggregator[validator.name] = this.globalValidatorReducer(
              validator
            )
          })
        }
        return validatorsAggregator
      }, {})
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
