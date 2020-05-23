const { publishEvent: publishEvent } = require('../subscriptions')
const { eventTypes, resourceTypes } = require('../notifications-types')

class BlockStore {
  constructor(network, database) {
    this.network = network
    this.latestHeight = 0
    this.block = {}
    this.stakingDenom = ''
    this.annualProvision = 0
    this.signedBlocksWindow = 0
    this.validators = {}
    this.proposals = []
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

  checkValidatorUpdates(validators) {
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

    if (validatorChangesList.length > 0) {
      this.sendValidatorPushNotifications(this.validators, validatorChangesList) // send validator push notifications async but dont wait for completion
    }
  }

  async sendValidatorPushNotifications(prevValidators, validatorChangesList) {
    const subscriptionPromises = validatorChangesList.map((validatorChange) => {
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

    return Promise.all(subscriptionPromises)
  }
}

module.exports = BlockStore
