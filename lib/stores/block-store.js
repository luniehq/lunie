const { publishEvent: publishEvent } = require('../subscriptions')
const { eventTypes, resourceTypes } = require('../notifications-types')
const fs = require('fs')
const path = require('path')

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
  }

  update({
    height,
    block = this.block,
    validators = this.validators,
    data = this.data // multi purpose block to be used for any chain specific data
  }) {
    // write file sync
    this.storeValidatorData(validators)
    if (Object.keys(this.validators).length !== 0) {
      this.checkValidatorUpdates(validators)
    }

    this.latestHeight = Number(height)
    this.block = block
    this.validators = validators
    this.data = data

    // when the data is available signal readyness so the resolver stop blocking the requests
    this.resolveReady()
  }

  /**
   * Write all validators to file storage
   * @param { Object } validators validatorMap
   */
  storeValidatorData(validators) {
    if (!fs.existsSync(this.validatorCachePath)) {
      fs.openSync(this.validatorCachePath, 'w')
    }
    fs.writeFileSync(this.validatorCachePath, JSON.stringify(validators))
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
    return validatorMap
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
}

module.exports = BlockStore
