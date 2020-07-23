const Sentry = require('@sentry/node')
const database = require('../database')
const config = require('../../config')

// global store is currently being destroyed with every network
// but this objects do persist
let validatorsLookup = {}
let networkCounter = 0
const networks = database(config)('').getNetworks()

class GlobalStore {
  constructor(database) {
    this.db = database
    this.store = {}
    this.globalValidators = {}

    this.dataReady = new Promise((resolve) => {
      this.resolveReady = resolve
    })
    this.dataReady.then(() => {
      console.log(`Global Store is ready`)
    })
    this.getReady()
  }

  async getReady() {
    if (Object.keys(this.store).length === 0) {
      setTimeout(async () => await this.getReady(), 1000)
    } else {
      await this.getGlobalValidators()
      this.resolveReady()
    }
  }

  upsertStoreToGlobalStore(newStore) {
    this.store = newStore
  }

  createGlobalValidatorsLookup() {
    const validatorsKeys = Object.keys(this.store.validators)
    validatorsKeys.forEach((key) => {
      let validator = this.store.validators[key]
      if (!validatorsLookup[validator.name]) {
        return (validatorsLookup[validator.name] = [key])
      } else {
        return validatorsLookup[validator.name].push(key)
      }
    })
  }

  calculateAverageUptimePercentage() {

  }

  async getGlobalValidators() {
    networkCounter++
    const premiumValidators = await this.db.getPremiumValidators()
    this.globalValidators = premiumValidators
    this.createGlobalValidatorsLookup()
    if (networkCounter >= networks.length) {
      return premiumValidators
    }
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
