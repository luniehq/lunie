const Sentry = require('@sentry/node')

let validatorsLookup = {}

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
