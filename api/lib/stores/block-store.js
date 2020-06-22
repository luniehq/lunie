const { keyBy } = require('lodash')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const Sentry = require('@sentry/node')
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
      ({ operatorAddress, name }) => ({
        operator_address: operatorAddress,
        name
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

  async storeNetwork() {
    try {
      // prepare network with the format we are going to store it in public/networks
      const dbNetwork = formatNetworkForDB(this.network)
      // store network in DB under public/networks
      this.db.storeNetwork(dbNetwork)
    } catch (error) {
      console.error('Failed during store network in DB', error)
      Sentry.captureException(error)
    }
  }

  async updateNetworkInDB() {
    try {
      const storedNetwork = await this.db.getNetwork(this.network.id)
      if (storedNetwork.length > 0) {
        // getNetwork only returns one network, so it is safe to do storedNetwork[0]
        // we update everything except the network id and powered
        this.network.enabled = storedNetwork[0].enabled
        this.network.experimental = storedNetwork[0].experimental
        this.network.title = storedNetwork[0].title
        this.network.chain_id = storedNetwork[0].chain_id
        this.network.rpc_url = storedNetwork[0].rpc_url
        this.network.api_url = storedNetwork[0].api_url
        this.network.bech32_prefix = storedNetwork[0].bech32_prefix
        this.network.testnet = storedNetwork[0].testnet
        this.network.default = storedNetwork[0].default
        this.network.stakingDenom = storedNetwork[0].stakingDenom
        this.network.address_prefix = storedNetwork[0].address_prefix
        this.network.address_creator = storedNetwork[0].address_creator
        this.network.ledger_app = storedNetwork[0].ledger_app
        this.network.network_type = storedNetwork[0].network_type
        this.network.source_class_name = storedNetwork[0].source_class_name
        this.network.block_listener_class_name =
          storedNetwork[0].block_listener_class_name
        this.network.icon = storedNetwork[0].icon
        this.network.slug = storedNetwork[0].slug
        this.network.lockUpPeriod = storedNetwork[0].lockUpPeriod
      } else {
        await this.storeNetwork(this.network)
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

function formatNetworkForDB(network) {
  // removed enabled
  return {
    network: {
      id: network.id,
      title: network.title,
      chain_id: network.chain_id,
      rpc_url: network.rpc_url,
      api_url: network.api_url,
      bech32_prefix: network.bech32_prefix,
      testnet: network.testnet,
      default: network.default,
      stakingDenom: network.stakingDenom,
      address_prefix: network.address_prefix,
      address_creator: network.address_creator,
      ledger_app: network.ledger_app,
      network_type: network.network_type,
      source_class_name: network.source_class_name,
      block_listener_class_name: network.block_listener_class_name,
      experimental: network.experimental,
      icon: network.icon,
      slug: network.slug,
      lockUpPeriod: network.lockUpPeriod,
      powered: JSON.stringify(network.powered)
    },
    coinLookups: network.coinLookup.map((coinLookup) => ({
      networkId: network.id,
      viewDenom: coinLookup.viewDenom,
      chainDenom: coinLookup.chainDenom,
      chainToViewConversionFactor: coinLookup.chainToViewConversionFactor
    })),
    networkCapabilities: {
      network_id: network.id,
      feature_session: network.feature_session,
      feature_portfolio: network.feature_portfolio,
      feature_validators: network.feature_validators,
      feature_proposals: network.feature_proposals,
      feature_activity: network.feature_activity,
      feature_explorer: network.feature_explorer,
      feature_explore: network.feature_explore,
      action_send: network.action_send,
      action_claim_rewards: network.action_claim_rewards,
      action_delegate: network.action_delegate,
      action_redelegate: network.action_delegate,
      action_undelegate: network.action_delegate,
      action_deposit: network.action_delegate,
      action_vote: network.action_delegate,
      action_proposal: network.action_delegate
    }
  }
}

module.exports = BlockStore
