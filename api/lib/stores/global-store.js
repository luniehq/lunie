const Sentry = require('@sentry/node')
const database = require('../database')
const config = require('../../config')

class GlobalStore {
  constructor(database) {
    this.db = database
    this.stores = []
    this.networks = []
    this.validatorsLookup = {}
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
    this.networks = await this.db.getNetworks()
    if (this.stores.length !== this.networks.length) {
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

  createGlobalValidatorsLookup() {
    this.stores.forEach((store) => {
      const validatorsKeys = Object.keys(store.validators)
      validatorsKeys.forEach((key) => {
        let validator = store.validators[key]
        if (!this.validatorsLookup[validator.name]) {
          return (this.validatorsLookup[validator.name] = [key])
        } else {
          return this.validatorsLookup[validator.name].push(key)
        }
      })
    })
  }

  calculateAverageUptimePercentage() {}

  async getGlobalValidators() {
    const premiumValidators = await this.db.getPremiumValidators()
    this.globalValidators = premiumValidators
    this.createGlobalValidatorsLookup()
    return premiumValidators
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
