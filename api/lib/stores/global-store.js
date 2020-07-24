const FiatValuesAPI = require('../fiatvalues-api')

class GlobalStore {
  constructor(database) {
    this.db = database
    this.stores = []
    this.networks = []
    this.validatorsLookup = {
      /* hardcode code coming */
    }
    this.globalValidators = {}
    this.fiatValuesAPI = undefined

    this.createFiatValuesAPI()

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

  createFiatValuesAPI() {
    this.fiatValuesAPI = new FiatValuesAPI()
  }

  // checks if the particular network store already lives in this.stores.
  // If so, it will update it. Otherwise, it will just push it in.
  upsertStoreToGlobalStore(newStore) {
    // first check if it is already there and in that case update store
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

  calculateNumberOfStakers() {} // help please ^^

  calculateTotalStaked(name) {
    let aggregatedTotalStaked = 0
    const validatorNetworks = Object.keys(this.validatorsLookup[name])
    validatorNetworks.map((network) => {
      const networkStore = this.stores.find(
        (store) => store.network.id === network
      )
      if (networkStore) {
        const validator =
          networkStore.validators[this.validatorsLookup[name][network]]
        aggregatedTotalStaked = aggregatedTotalStaked + Number(validator.tokens)
      }
    })
    return aggregatedTotalStaked
  }

  async calculateTotalStakedAssets(name, fiatCurrency) {
    let aggregatedTotalStakedAssets = {}
    const validatorNetworks = Object.keys(this.validatorsLookup[name])
    validatorNetworks.map(async (network) => {
      const networkStore = this.stores.find(
        (store) => store.network.id === network
      )
      if (networkStore && networkStore.stakingDenom.length > 0) {
        const validator =
          networkStore.validators[this.validatorsLookup[name][network]]
        const newTotalStakedAsset = {
          denom: networkStore.stakingDenom,
          amount: Number(validator.tokens),
          fiatValue: await this.fiatValuesAPI.calculateFiatValues(
            [
              {
                denom: networkStore.stakingDenom,
                amount: validator.tokens
              }
            ],
            fiatCurrency
          )
        }
        aggregatedTotalStakedAssets = {
          ...aggregatedTotalStakedAssets,
          ...newTotalStakedAsset
        }
      }
    })
    return aggregatedTotalStakedAssets
  }

  // should get the latest notifications (last 3 days) concercing all validator's addresses
  async getValidatorFeed(name) {
    const validatorNetworks = Object.keys(this.validatorsLookup[name])
    return await Promise.all(
      validatorNetworks.map(async (network) => {
        const networkStore = this.stores.find(
          (store) => store.network.id === network
        )
        if (networkStore) {
          const validator =
            networkStore.validators[this.validatorsLookup[name][network]]
          return await this.db.getLatestValidatorNotifications(
            validator.operatorAddress
          )
        }
      })
    )
  }

  calculateAverageUptimePercentage(name) {
    let aggregatedUptimePercentage = 0
    const validatorNetworks = Object.keys(this.validatorsLookup[name])
    validatorNetworks.map((network) => {
      const networkStore = this.stores.find(
        (store) => store.network.id === network
      )
      if (networkStore) {
        const validator =
          networkStore.validators[this.validatorsLookup[name][network]]
        aggregatedUptimePercentage =
          aggregatedUptimePercentage + validator.uptimePercentage
      }
    })
    // divide aggregated uptimePercentage by number of networks
    const averageUptimePercentage =
      aggregatedUptimePercentage / validatorNetworks.length
    return averageUptimePercentage
  }

  createGlobalValidatorsLookup(premiumValidators) {
    this.validatorsLookup = premiumValidators.reduce(
      (validatorsLookup, validator) => {
        return (validatorsLookup = {
          ...validatorsLookup,
          [validator.name]: JSON.parse(validator.operatorAddresses)
        })
      },
      {}
    )
  }

  async getGlobalValidators() {
    const premiumValidators = await this.db.getPremiumValidators()
    this.createGlobalValidatorsLookup(premiumValidators)
    this.globalValidators = await Promise.all(
      premiumValidators.map(
        async (validator) => await this.globalValidatorReducer(validator)
      )
    )
    return this.globalValidators
  }

  async globalValidatorReducer(validator) {
    // add manually input validator data with on-chain calculated data
    return {
      ...validator,
      numberStakers: this.calculateNumberOfStakers(validator.name),
      totalStaked: this.calculateTotalStaked(validator.name),
      totalStakedAssets: await this.calculateTotalStakedAssets(validator.name),
      uptime: this.calculateAverageUptimePercentage(validator.name),
      feed: await this.getValidatorFeed(validator.name)
    }
  }
}

module.exports = GlobalStore
