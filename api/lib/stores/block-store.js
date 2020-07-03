const { keyBy } = require('lodash')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const Sentry = require('@sentry/node')
const database = require('../database')
const config = require('../../config')
const { publishEvent: publishEvent } = require('../subscriptions')
const { eventTypes, resourceTypes } = require('../notifications-types')

class BlockStore {
  constructor(network, database) {
    this.network = network
    this.validatorCachePath = path.join(
      __dirname,
      '..',
      '..',
      'caches',
      `validators-${network.id}.json`
    )
    this.latestHeight = 0
    this.block = {}
    this.stakingDenom = ''
    this.annualProvision = 0
    this.signedBlocksWindow = 0
    this.validators = {}
    this.proposals = []
    this.newValidators = {}
    this.db = database

    // system to stop queries to proceed if store data is not yet available
    this.resolveReady
    this.dataReady = new Promise((resolve) => {
      this.resolveReady = resolve
    })
    this.db = database

    this.loadStoredValidatorData()
  }

  async update({
    height,
    block = this.block,
    validators,
    data = this.data // multi purpose block to be used for any chain specific data
  }) {
    if (validators) {
      // convert to map
      validators = this.getValidatorMap(validators)

      // TODO get pictures and popularity in parallel
      // add picture
      validators = await this.addValidatorPictures(validators)

      // add popularity field
      validators = await this.addPopularityToValidators(
        validators,
        this.network.id
      )

      // write file async
      this.storeValidatorData(validators)

      // write validators to db to have all validators in the db to add pictures
      this.updateDBValidatorProfiles(validators)

      if (Object.keys(this.validators).length !== 0) {
        this.checkValidatorUpdates(validators)
      }

      this.validators = validators
    }

    this.latestHeight = Number(height)
    this.block = block
    this.data = data

    // when the data is available signal readyness so the resolver stop blocking the requests
    if (this.validators) {
      this.resolveReady()
    }
  }

  /**
   * Write all validators to file storage
   * @param { Object } validators validatorMap
   */
  storeValidatorData(validators) {
    if (!fs.existsSync(this.validatorCachePath)) {
      fs.openSync(this.validatorCachePath, 'w')
    }
    fs.writeFile(this.validatorCachePath, JSON.stringify(validators), (err) => {
      if (err) Sentry.captureException(err)
    })
  }

  /**
   * Load validator data from file storage
   * Function gets triggered when store is created
   */
  loadStoredValidatorData() {
    if (
      !fs.existsSync(this.validatorCachePath) ||
      fs.readFileSync(this.validatorCachePath, 'utf8') === ''
    )
      return {}

    const validatorMap = JSON.parse(
      fs.readFileSync(this.validatorCachePath, 'utf8')
    )

    // Set validator store equal to validatorMap from file storage
    this.validators = validatorMap
    this.resolveReady()
  }

  // this adds all the validator addresses to the database so we can easily check in the database which ones have an image and which ones don't
  async updateDBValidatorProfiles(validators) {
    const validatorRows = Object.values(validators).map(
      ({ operatorAddress, name, identity }) => ({
        operator_address: operatorAddress,
        name,
        profile_identifier: identity
      })
    )
    return this.db.upsert('validatorprofiles', validatorRows)
  }

  checkValidatorUpdates(validators) {
    // Map between property and associated event type
    const validatorProperties = {
      status: eventTypes.VALIDATOR_STATUS,
      commission: eventTypes.VALIDATOR_COMMISSION,
      votingPower: eventTypes.VALIDATOR_VOTING_POWER_INCREASE,
      picture: eventTypes.VALIDATOR_PICTURE,
      description: eventTypes.VALIDATOR_DESCRIPTION,
      website: eventTypes.VALIDATOR_WEBSITE,
      maxChangeCommission: eventTypes.VALIDATOR_MAX_CHANGE_COMMISSION
    }

    const validatorChangesList = Object.keys(validatorProperties).reduce(
      (validatorChanges, property) => {
        Object.values(validators).filter((validator) => {
          // Discard if validator is not in store yet
          if (!this.validators[validator.operatorAddress]) {
            // Store new validator temporarily
            this.newValidators[validator.operatorAddress] = validator

            // Discard
            return
          }

          // Discard updates for votingpower that are less than 3% difference
          if (property === 'votingPower') {
            const prevVotingPower = Number(
              this.validators[validator.operatorAddress][property]
            )
            const nextVotingPower = Number(validator[property])
            const percentageDifference =
              (100 * (nextVotingPower - prevVotingPower)) /
              ((nextVotingPower + prevVotingPower) / 2)

            // check for isNaN when votingPower = 0.0000 we are divinding by zero resulting in NaN
            if (
              !isNaN(percentageDifference) &&
              Math.abs(percentageDifference) > 3
            ) {
              // Push increase or decrease event for voting power based on sign of percentageDifference var
              let eventType = validatorProperties[property]
              if (Math.sign(percentageDifference) === -1)
                eventType = eventTypes.VALIDATOR_VOTING_POWER_DECREASE

              validatorChanges.push({
                operatorAddress: validator.operatorAddress,
                validator,
                changedProperty: property,
                eventType
              })
            }
            return
          }

          if (
            validator[property] !==
            this.validators[validator.operatorAddress][property]
          ) {
            validatorChanges.push({
              operatorAddress: validator.operatorAddress,
              validator,
              changedProperty: property,
              eventType: validatorProperties[property]
            })
          }
        })
        return validatorChanges
      },
      []
    )

    if (Object.keys(this.newValidators).length > 0) {
      this.sendNewValidatorNotifications(Object.values(this.newValidators))
      this.newValidators = {}
    }

    if (validatorChangesList.length > 0) {
      this.sendValidatorNotifications(this.validators, validatorChangesList) // send validator push notifications async but dont wait for completion
    }
  }

  async sendNewValidatorNotifications(validators) {
    const notificationPromises = validators.map((validator) => {
      return publishEvent(
        this.network.id,
        resourceTypes.VALIDATOR,
        eventTypes.VALIDATOR_ADDED,
        validator.operatorAddress,
        {
          prevValidator: null,
          nextValidator: validator
        }
      )
    })

    return Promise.all(notificationPromises)
  }

  async sendValidatorNotifications(prevValidators, validatorChangesList) {
    const notificationPromises = validatorChangesList.map((validatorChange) => {
      return publishEvent(
        this.network.id,
        resourceTypes.VALIDATOR,
        validatorChange.eventType,
        validatorChange.operatorAddress,
        {
          prevValidator: prevValidators[validatorChange.operatorAddress],
          nextValidator: validatorChange.validator
        }
      )
    })

    return Promise.all(notificationPromises)
  }

  async addPopularityToValidators(validators, networkId) {
    // popularity is actually the number of views of a validator on their page
    const validatorPopularity = await this.db.getValidatorsViews(networkId)
    validatorPopularity.forEach(({ operator_address, requests }) => {
      if (validators[operator_address]) {
        validators[operator_address].popularity = requests
      }
    })
    return validators
  }

  getValidatorMap(validators) {
    const validatorMap = keyBy(validators, 'operatorAddress')
    return validatorMap
  }

  async addValidatorPictures(validators) {
    const validatorInfo = await this.db.getValidatorsInfo()
    const validatorInfoMap = keyBy(validatorInfo, 'operator_address')
    return _.keyBy(
      Object.entries(validators).map(([operatorAddress, validator]) =>
        enrichValidator(validatorInfoMap[operatorAddress], validator)
      ),
      'operatorAddress'
    )
  }

  async updateNetworkFromDB() {
    try {
      const storedNetwork = await database(config)('').getNetwork(
        this.network.id
      )
      if (storedNetwork) {
        Object.assign(this.network, storedNetwork)
      } else {
        console.error(`This network is not present in the DB`)
      }
    } catch (error) {
      console.error('Failed during update network in DB', error)
      Sentry.captureException(error)
    }
  }
}

function enrichValidator(validatorInfo, validator) {
  const picture = validatorInfo ? validatorInfo.picture : undefined
  const name =
    validatorInfo && validatorInfo.name ? validatorInfo.name : validator.name

  return {
    ...validator,
    name,
    picture: picture === 'null' || picture === 'undefined' ? undefined : picture
  }
}

module.exports = BlockStore
