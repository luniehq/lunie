const _ = require('lodash')
const {
  publishBlockAdded,
  publishUserTransactionAdded,
  publishEvent: publishEvent
} = require('../subscriptions')
const Sentry = require('@sentry/node')
const database = require('../database')
const config = require('../../config.js')

const POLLING_INTERVAL = 1000
const EXPECTED_MAX_BLOCK_WINDOW = 120000
// apparently the cosmos db takes a while to serve the content after a block has been updated
// if we don't do this, we run into errors as the data is not yet available
const COSMOS_DB_DELAY = 2000

// This class polls for new blocks
// Used for listening to events, such as new blocks.
class CosmosNodeSubscription {
  constructor(network, CosmosApiClass, store) {
    this.network = network
    this.cosmosAPI = new CosmosApiClass(network)
    this.store = store
    const networkSchemaName = this.network.id.replace(/-/g, '_')
    this.db = new database(config)(networkSchemaName)
    this.chainHangup = undefined
    this.height = undefined

    this.pollForNewBlock()
  }

  async pollForNewBlock() {
    this.pollingTimeout = setTimeout(async () => {
      const block = await this.cosmosAPI.getBlockByHeight()
      if (this.height !== block.height) {
        // apparently the cosmos db takes a while to serve the content after a block has been updated
        // if we don't do this, we run into errors as the data is not yet available
        setTimeout(() => this.newBlockHandler(block), COSMOS_DB_DELAY)
        this.height = block.height // this needs to be set somewhere

        // we are safe, that the chain produced a block so it didn't hang up
        if (this.chainHangup) clearTimeout(this.chainHangup)
      }

      this.pollForNewBlock()
    }, POLLING_INTERVAL)

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
  async newBlockHandler(block) {
    Sentry.configureScope(function(scope) {
      scope.setExtra('height', block.height)
    })

    const validators = await this.cosmosAPI.getAllValidators(block.height)
    const validatorMap = await this.getValidatorMap(validators)
    this.updateDBValidatorProfiles(validators)
    this.store.update({ height: block.height, block, validators: validatorMap })
    publishBlockAdded(this.network.id, block)
    // TODO remove, only for demo purposes
    // publishEvent(this.network.id, 'block', '', block)

    // For each transaction listed in a block we extract the relevant addresses. This is published to the network.
    // A GraphQL resolver is listening for these messages and sends the
    // transaction to each subscribed user.
    // TODO doesn't handle failing txs as it doesn't extract addresses from those txs (they are not tagged)
    block.transactions.forEach(tx => {
      let addresses = []
      try {
        this.cosmosAPI.extractInvolvedAddresses(tx.raw).forEach(address => {
          addresses.push(address)
        })
      } catch (err) {
        Sentry.withScope(function(scope) {
          scope.setExtra('transaction', tx.raw)
          Sentry.captureException(err)
        })
      }
      addresses = _.uniq(addresses)
      addresses.forEach(address => {
        publishUserTransactionAdded(this.network.id, address, tx)
        publishEvent(this.network.id, 'transaction', address, tx)
      })
    })

    this.cosmosAPI.memoizedResults.clear()
  }

  async getValidatorMap(validators) {
    const validatorMap = _.keyBy(validators, 'operatorAddress')
    return validatorMap
  }

  // this adds all the validator addresses to the database so we can easily check in the database which ones have an image and which ones don't
  async updateDBValidatorProfiles(validators) {
    const validatorRows = validators.map(({ operatorAddress, name }) => ({
      operator_address: operatorAddress,
      name
    }))
    return this.db.upsert('validatorprofiles', validatorRows)
  }
}

module.exports = CosmosNodeSubscription
