const {
  publishBlockAdded,
  publishUserTransactionAddedV2,
  publishEvent: publishEvent
} = require('../subscriptions')
const Sentry = require('@sentry/node')
const database = require('../database')
const { orderBy } = require('lodash')
const config = require('../../config.js')
const {
  lunieMessageTypes: { SEND }
} = require('../message-types.js')
const {
  eventTypes,
  resourceTypes
} = require('../notifications/notifications-types')
const BLOCK_POLLING_INTERVAL = 1000
const EXPECTED_MAX_BLOCK_WINDOW = 120000
// apparently the cosmos db takes a while to serve the content after a block has been updated
// if we don't do this, we run into errors as the data is not yet available
const COSMOS_DB_DELAY = 2000
const PROPOSAL_POLLING_INTERVAL = 600000 // 10min
const UPDATE_NETWORKS_POLLING_INTERVAL = 60000 // 1min

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
    // start one minute loop to update networks
    this.pollForUpdateNetworks()
  }

  async pollForProposalChanges() {
    // If you create this.cosmosAPI object in constructor, it will stay forever as it caches
    // Don't want this behaviour as this needs to be recreated with every new context
    const cosmosAPI = new this.CosmosApiClass(this.network, this.store)

    // set store upon start
    this.store.update({
      proposals: await cosmosAPI.getAllProposals()
    })

    this.proposalPollingTimeout = setTimeout(async () => {
      this.pollForProposalChanges()
    }, PROPOSAL_POLLING_INTERVAL)
  }

  async pollForUpdateNetworks() {
    // gives us the control to modify network parameters
    this.store.updateNetworkFromDB()
    this.updateNetworksPollingTimeout = setTimeout(async () => {
      this.pollForUpdateNetworks()
    }, UPDATE_NETWORKS_POLLING_INTERVAL)
  }

  async checkForNewBlock(cosmosAPI) {
    let block
    try {
      block = await cosmosAPI.getBlockByHeightV2()
    } catch (error) {
      console.error('Failed to fetch block', error)
      Sentry.captureException(error)
      return
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
      await this.store.update({
        height: block.height,
        block,
        validators: validators
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
}

module.exports = CosmosNodeSubscription
