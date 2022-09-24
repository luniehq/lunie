const { keyBy, difference } = require('lodash')
const _ = require('lodash')
const Sentry = require('@sentry/node')
const database = require('../database')
const config = require('../../config')
const { publishEvent: publishEvent } = require('../subscriptions')
const {
  eventTypes,
  resourceTypes
} = require('../notifications/notifications-types')

class BlockStore {
  constructor(network, database) {
    this.network = network
    this.block = {}
    this.stakingDenom = ''
    this.annualProvision = 0
    this.signedBlocksWindow = 0
    this.validators = {}
    this.identities = {}
    this.proposals = []
    this.newValidators = {}
    this.db = database
    this.data = {}

    // system to stop queries to proceed if store data is not yet available
    this.dataReady = new Promise((resolve) => {
      this.resolveReady = resolve
    })
    this.dataReady.then(() => {
      console.log(this.network.id, 'is ready')
    })
    // Deactivated for now. Get store from DB
    // this.getStore().then((foundStore) => {
    //   if (foundStore) this.resolveReady()
    // })
  }

  async getStore() {
    try {
      const result = await database(config)('').getStore(this.network.id)
      if (result) {
        const dbStore = JSON.parse(result.store)
        Object.assign(this, dbStore)
      }
      return true
    } catch (error) {
      console.error(error)
      Sentry.captureException(error)
      return false
    }
  }

  async update({
    block = this.block,
    validators,
    proposals,
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

      // write validators to db to have all validators in the db to add pictures
      this.updateDBValidatorProfiles(validators)

      if (Object.keys(this.validators).length !== 0) {
        this.checkValidatorUpdates(validators)
      }

      this.validators = validators
    }

    this.block = block
    this.data = Object.assign({}, this.data, data)

    if (proposals) {
      this.checkProposalsUpdate(this.proposals, proposals)
      this.proposals = proposals
    }

    // when the data is available signal readyness so the resolver stop blocking the requests
    // we assume existance of validators in most queries so we wait for the validators to be there
    if (Object.keys(this.validators).length > 0) {
      this.resolveReady()
    }
    // save store in DB to improve API perfomance on startup. Deactivated for now
    // storeStoreInDB(this)
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

  checkProposalsUpdate(oldProposals, newProposals) {
    const oldProposalsDictionary = keyBy(oldProposals, 'id')
    const newProposalsDictionary = keyBy(newProposals, 'id')

    // Safety check
    // On the first run we don't have old proposals in the store
    if (oldProposals.length === 0) return

    // case 1: New proposal
    const newProposalIds = difference(
      Object.keys(newProposalsDictionary),
      Object.keys(oldProposalsDictionary)
    )
    if (newProposalIds.length > 0) {
      newProposalIds.forEach((id) => {
        const newProposal = newProposalsDictionary[id]

        publishEvent(
          this.network.id,
          resourceTypes.PROPOSAL,
          eventTypes.PROPOSAL_CREATE,
          newProposal.id,
          newProposal
        )
      })
    }

    // case 2: Check for status changes
    Object.entries(newProposalsDictionary).forEach(([id, proposal]) => {
      if (
        oldProposalsDictionary[id] &&
        oldProposalsDictionary[id].status !== proposal.status
      ) {
        publishEvent(
          this.network.id,
          resourceTypes.PROPOSAL,
          eventTypes.PROPOSAL_UPDATE,
          proposal.id,
          proposal
        )
      }
    })
  }
}

function enrichValidator(validatorInfo, validator) {
  const picture = validatorInfo ? validatorInfo.picture : undefined

  return {
    ...validator,
    picture: picture === 'null' || picture === 'undefined' ? undefined : picture
  }
}

async function storeStoreInDB(store) {
  const clone = JSON.parse(JSON.stringify(store))
  delete clone.db
  delete clone.network
  await database(config)('').storeStore({
    store: clone,
    networkId: store.network.id
  })
}

module.exports = BlockStore
module.exports.enrichValidator = enrichValidator
