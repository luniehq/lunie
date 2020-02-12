const _ = require('lodash')
const io = require('@pm2/io')
const Tendermint = require('../rpc/tendermint')
const {
  publishBlockAdded,
  publishUserTransactionAdded,
  publishEvent: publishEvent
} = require('../subscriptions')
const Sentry = require('@sentry/node')
const database = require('../database')
const config = require('../../config.js')

const WAIT_FOR_BLOCK_DELAY = 5000
const EXPECTED_MAX_BLOCK_WINDOW = 120000

// let reconnectionTimeout = {}

// This class establishes an rpc connection to Tendermint.
// Used for listening to events, such as new blocks.
class CosmosNodeSubscription {
  constructor(network, CosmosApiClass, store) {
    this.network = network
    this.cosmosAPI = new CosmosApiClass(network)
    this.store = store
    this.lastupdate = 0
    this.metric = io.metric({
      name: `${this.network.id}_update`
    })
    const networkSchemaName = this.network.id.replace(/-/g, '_')
    this.db = new database(config)(networkSchemaName)
    this.chainHangup = undefined

    this.connectTendermint(this.network)
  }

  async connectTendermint(network) {
    console.log('Connecting to Tendermint on', network.rpc_url)
    // Create a RPC subscription for each network that will react to new block events.
    Tendermint()
      .connect(network.rpc_url)
      .then(connectedClient => {
        console.log('Connected to Tendermint on', network.rpc_url)
        connectedClient.subscribe({ query: "tm.event='NewBlock'" }, event => {
          // this tracks the block times
          // issue: this will only trigger if there are actually blocks I guess
          if (this.lastupdate) {
            const diff = Date.now() - this.lastupdate
            this.metric.set(diff)
          }
          this.lastupdate = Date.now()

          setTimeout(
            () => this.newBlockHandler(event.block.header.height),
            WAIT_FOR_BLOCK_DELAY
          )

          // if there are no new blocks for some time, trigger an error
          // TODO: show this error automatically in the UI
          if (this.chainHangup) clearTimeout(this.chainHangup)
          this.chainHangup = setTimeout(() => {
            console.error(`Chain ${this.network.id} seems to have halted.`)
            Sentry.captureException(
              new Error(`Chain ${this.network.id} seems to have halted.`)
            )
          }, EXPECTED_MAX_BLOCK_WINDOW)
        })

        // on connection lost, reconnect to tendermint + Sentry error
        connectedClient.ondisconnect = () => {
          console.log('Lost connection to Tendermint for', network.rpc_url)

          Sentry.withScope(function(scope) {
            scope.setExtra('network', network.id)
            scope.setExtra('rpc_url', network.rpc_url)
            Sentry.captureException(new Error(`Lost Tendermint connection`))
          })
          // need to clear previous timeout to evoid connection hell
          // clearTimeout(reconnectionTimeout[network.id])
          // reconnectionTimeout[network.id] = setTimeout(
          //   () => this.connectTendermint(network),
          //   3000
          // )
        }
      })
      .catch(e => {
        Sentry.withScope(function(scope) {
          scope.setExtra('network', network.id)
          scope.setExtra('rpc_url', network.rpc_url)
          Sentry.captureException(e)
        })

        // clearTimeout(reconnectionTimeout[network.id])
        // // if can't connect, retry
        // reconnectionTimeout[network.id] = setTimeout(
        //   () => this.connectTendermint(network),
        //   3000
        // )
      })
  }

  // For each block event, we fetch the block information and publish a message.
  // A GraphQL resolver is listening for these messages and sends the block to
  // each subscribed user.
  async newBlockHandler(height) {
    if (height) {
      Sentry.configureScope(function(scope) {
        scope.setExtra('height', height)
      })
    }

    const block = await this.cosmosAPI.getBlockByHeight({
      blockHeight: height
    })
    // in the case of height being undefined to query for latest
    // eslint-disable-next-line require-atomic-updates
    height = block.height

    const validators = await this.cosmosAPI.getAllValidators(height)
    const validatorMap = await this.getValidatorMap(validators)
    this.updateDBValidatorProfiles(validators)
    this.store.update({ height, block, validators: validatorMap })
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
