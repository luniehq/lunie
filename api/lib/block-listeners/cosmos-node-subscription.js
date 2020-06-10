const {
  publishBlockAdded,
  publishUserTransactionAddedV2,
  publishEvent: publishEvent
} = require('../subscriptions')
const Sentry = require('@sentry/node')
const database = require('../database')
const { orderBy, keyBy } = require('lodash')
const config = require('../../config.js')
const {
  lunieMessageTypes: { SEND }
} = require('../message-types.js')
const { eventTypes, resourceTypes } = require('../notifications-types')
const BLOCK_POLLING_INTERVAL = 1000
const EXPECTED_MAX_BLOCK_WINDOW = 120000
// apparently the cosmos db takes a while to serve the content after a block has been updated
// if we don't do this, we run into errors as the data is not yet available
const COSMOS_DB_DELAY = 2000
const PROPOSAL_POLLING_INTERVAL = 600000 // 10min

// This class polls for new blocks
// Used for listening to events, such as new blocks.
class CosmosNodeSubscription {
  constructor(network, CosmosApiClass, store) {
    this.network = network
    this.CosmosApiClass = CosmosApiClass
    this.store = store
    this.validators = []
    const networkSchemaName = this.network.id.replace(/-/g, '_')
    this.db = new database(config)(networkSchemaName)
    this.chainHangup = undefined
    this.height = undefined

    if (network.feature_proposals === 'ENABLED') this.pollForProposalChanges()

    this.pollForNewBlock()
  }

  async pollForProposalChanges() {
    // If you create this.cosmosAPI object in constructor, it will stay forever as it caches
    // Don't want this behaviour as this needs to be recreated with every new context
    const cosmosAPI = new this.CosmosApiClass(this.network, this.store)

    // set store upon start
    this.store.proposals = await cosmosAPI.getAllProposals()

    this.proposalPollingTimeout = setTimeout(async () => {
      await this.checkProposals(cosmosAPI)

      this.pollForProposalChanges()
    }, PROPOSAL_POLLING_INTERVAL)
  }

  async checkProposals(cosmosAPI) {
    const newProposals = await cosmosAPI.getAllProposals()
    const storedProposals = orderBy(this.store.proposals, 'id', 'asc')
    const sortedNewProposals = orderBy(newProposals, 'id', 'asc')

    // Safety check
    if (newProposals.length === 0) return

    // case 1: New proposal
    if (newProposals.length !== this.store.proposals.length) {
      const newProposal = sortedNewProposals[sortedNewProposals.length - 1]

      publishEvent(
        this.network.id,
        resourceTypes.PROPOSAL,
        eventTypes.PROPOSAL_CREATE,
        newProposal.id,
        newProposal
      )
    }

    // case 2: Check for status changes
    sortedNewProposals.forEach((proposal, index) => {
      if (
        storedProposals[index] &&
        storedProposals[index].status !== proposal.status
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

    // Set new proposal list
    this.store.proposals = sortedNewProposals
  }

  async checkForNewBlock(cosmosAPI) {
    let block
    try {
      block = await cosmosAPI.getBlockByHeightV2()
    } catch (error) {
      console.error('Failed to fetch block', error)
      Sentry.captureException(error)
    }
    // overwrite chain_id with the network's one, making sure it is correct
    this.store.network.chain_id = block.chainId
    if (block && this.height !== block.height) {
      // apparently the cosmos db takes a while to serve the content after a block has been updated
      // if we don't do this, we run into errors as the data is not yet available
      setTimeout(() => this.newBlockHandler(block, cosmosAPI), COSMOS_DB_DELAY)
      this.height = block.height // this needs to be set somewhere

      // we are safe, that the chain produced a block so it didn't hang up
      if (this.chainHangup) clearTimeout(this.chainHangup)
    }
  }

  async pollForNewBlock() {
    const cosmosAPI = new this.CosmosApiClass(this.network, this.store)
    await this.checkForNewBlock(cosmosAPI)

    this.pollingTimeout = setTimeout(async () => {
      await this.checkForNewBlock(cosmosAPI)

      this.pollForNewBlock()
    }, BLOCK_POLLING_INTERVAL)

    // if there are no new blocks for some time, trigger an error
    // TODO: show this error automatically in the UI
    // clearing previous timeout, otherwise it will execute
    if (this.chainHangup) clearTimeout(this.chainHangup)
    this.chainHangup = setTimeout(() => {
      console.error(`Chain ${this.network.id} seems to have halted.`)
      Sentry.captureException(
        new Error(`Chain ${this.network.id} seems to have halted.`)
      )
    }, EXPECTED_MAX_BLOCK_WINDOW)
  }

  // For each block event, we fetch the block information and publish a message.
  // A GraphQL resolver is listening for these messages and sends the block to
  // each subscribed user.
  async newBlockHandler(block, cosmosAPI) {
    try {
      Sentry.configureScope(function (scope) {
        scope.setExtra('height', block.height)
      })

      // allow for network specific block handlers
      if (cosmosAPI.newBlockHandler) {
        await cosmosAPI.newBlockHandler(block, this.store)
      }

      const validators = await cosmosAPI.getAllValidators(block.height)
      const validatorMap = await this.getValidatorMap(validators)
      this.updateDBValidatorProfiles(validators)
      this.store.update({
        height: block.height,
        block,
        validators: validatorMap
      })
      publishBlockAdded(this.network.id, block)

      // For each transaction listed in a block we extract the relevant addresses. This is published to the network.
      // A GraphQL resolver is listening for these messages and sends the
      // transaction to each subscribed user.
      // TODO doesn't handle failing txs as it doesn't extract addresses from those txs (they are not tagged)
      block.transactions.forEach((tx) => {
        tx.involvedAddresses.forEach((address) => {
          const involvedAddress = address
          publishUserTransactionAddedV2(this.network.id, involvedAddress, tx)

          if (tx.type === SEND) {
            const eventType =
              involvedAddress === tx.details.from[0]
                ? eventTypes.TRANSACTION_SEND
                : eventTypes.TRANSACTION_RECEIVE
            publishEvent(
              this.network.id,
              resourceTypes.TRANSACTION,
              eventType,
              involvedAddress,
              tx
            )
          }
        })
      })
    } catch (error) {
      console.error('newBlockHandler failed', error)
      Sentry.captureException(error)
    }
  }

  async getValidatorMap(validators) {
    const validatorMap = keyBy(validators, 'operatorAddress')
    return validatorMap
  }

  // this adds all the validator addresses to the database so we can easily check in the database which ones have an image and which ones don't
  async updateDBValidatorProfiles(currentValidators) {
    // filter only new validators
    let updatedValidators = currentValidators.filter(
      ({ operatorAddress: currentAddress, name: currentName }) =>
        !this.validators.find(
          ({ operatorAddress, name }) =>
            currentAddress === operatorAddress && currentName === name // in case if validator name was changed
        )
    )
    // save all new validators to an array
    this.validators = [
      ...this.validators.filter(
        ({ operatorAddress }) =>
          !updatedValidators.find(
            ({ operatorAddress: newValidatorOperatorAddress }) =>
              newValidatorOperatorAddress === operatorAddress
          )
      ),
      ...updatedValidators.map(({ operatorAddress, name }) => ({
        operatorAddress,
        name
      }))
    ]
    // update only new onces
    const validatorRows = updatedValidators.map(
      ({ operatorAddress, name }) => ({
        operator_address: operatorAddress,
        name
      })
    )
    return this.db.upsert('validatorprofiles', validatorRows)
  }
}

module.exports = CosmosNodeSubscription
