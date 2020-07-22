const Sentry = require('@sentry/node')

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
    this.getStores()
  }

  async getStores() {
    const networks = await this.db.getNetworks()
    if (networks.length !== this.stores.length) {
      setTimeout(async () => await this.getStores(), 1000)
    } else {
      await this.getGlobalValidators()
      this.resolveReady()
    }
  }

  upsertStoreToGlobalStore(newStore) {
    // first check if it is already there In that case update store
    if (
      this.stores.length > 0 &&
      this.stores.find((store) => store.network.id === newStore.network.id)
    ) {
      this.stores = this.stores.reduce((updatedGlobalStores, store) => {
        if (store.network.id === newStore.network.id) {
          updatedGlobalStores.push(newStore)
          return updatedGlobalStores
        } else {
          updatedGlobalStores.push(store)
          return updatedGlobalStores
        }
      }, [])
      // otherwise push to the list
    } else {
      this.stores.push(newStore)
    }
  }

  getGlobalValidators() {
    const aggregatedValidators = this.stores
      .map(({ validators }) => validators)
      .reduce((validatorsAggregator, validators) => {
        const validatorsKeys = Object.keys(validators)
        validatorsKeys.forEach((key) => {
          let validator = validators[key]
          if (!validatorsAggregator[validator.name]) {
            validatorsAggregator[validator.name] = this.globalValidatorReducer(
              validator
            )
          }
        })
        return validatorsAggregator
      }, {})
    this.globalValidators = aggregatedValidators
    return aggregatedValidators
  }

  globalValidatorReducer(validator) {
    // TODO: calculate uptimePercentage average cross-chain
    return {
      name: validator.name,
      uptimePercentage: validator.uptimePercentage
    }
  }
}

module.exports = GlobalStore
