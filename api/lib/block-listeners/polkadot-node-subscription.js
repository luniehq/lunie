const { ApiPromise, WsProvider } = require('@polkadot/api')
const fetch = require('node-fetch')
const {
  publishBlockAdded,
  publishUserTransactionAddedV2,
  publishEvent: publishEvent
} = require('../subscriptions')
const {
  lunieMessageTypes: { SEND }
} = require('../message-types.js')
const { eventTypes, resourceTypes } = require('../notifications-types')
const Sentry = require('@sentry/node')
const database = require('../database')
const config = require('../../config.js')

const POLLING_INTERVAL = 1000
const UPDATE_NETWORKS_POLLING_INTERVAL = 60000 // 1min

// This class polls for new blocks
// Used for listening to events, such as new blocks.
class PolkadotNodeSubscription {
  constructor(network, PolkadotApiClass, store) {
    this.network = network
    this.polkadotAPI = new PolkadotApiClass(network, store)
    this.store = store
    this.validators = []
    this.sessionValidators = []
    const networkSchemaName = this.network.id.replace(/-/g, '_')
    this.db = new database(config)(networkSchemaName)
    this.height = 0
    this.currentSessionIndex = 0
    this.currentEra = 0
    this.blockQueue = []
    this.chainId = this.network.chain_id
    this.subscribeForNewBlock()
    // start one minute loop to update networks
    this.pollForUpdateNetworks()
  }

  // here we init the polkadot rpc once for all processes
  // the class gets stored in the store to be used by all instances
  async initPolkadotRPC() {
    this.api = new ApiPromise({
      provider: new WsProvider(
        this.network.rpc_url || this.network.public_rpc_url
      )
    })
    this.store.polkadotRPC = this.api
    this.store.polkadotRPCOpened = Date.now()
    await this.api.isReady
    console.log('Polkadot initialized')
  }

  async subscribeForNewBlock() {
    // here we init the polkadot rpc once for all processes
    if (!this.api) {
      await this.initPolkadotRPC()
    }

    // Subscribe to new block headers
    await this.api.rpc.chain.subscribeNewHeads(async (blockHeader) => {
      const blockHeight = blockHeader.number.toNumber()
      if (this.height < blockHeight) {
        this.height = blockHeight
        this.newBlockHandler(blockHeight) // do not await as this can take some seconds
      }
    })
  }

  // Sometimes blocks get published unordered so we need to enqueue
  // them before publish to ensure correct order. This adds 3 blocks delay.
  enqueueAndPublishBlockAdded(newBlock) {
    this.blockQueue.push(newBlock)
    if (this.blockQueue.length > 2) {
      this.blockQueue = this.blockQueue.sort((a, b) => a.height - b.height)
      publishBlockAdded(this.network.id, this.blockQueue.shift())
    }
  }

  // poll latest block height and handle all blocks unknown to this API yet in order
  async checkForNewBlock() {
    try {
      const blockHeight = await this.polkadotAPI.getBlockHeight()

      // if we get a newer block then expected query for all the outstanding blocks
      while (blockHeight > this.height) {
        this.height = this.height ? this.height++ : blockHeight
        this.newBlockHandler(this.height)

        // we are safe, that the chain produced a block so it didn't hang up
        if (this.chainHangup) clearTimeout(this.chainHangup)
      }
    } catch (error) {
      console.error('Failed to check for a new block', error)
      Sentry.captureException(error)
    }
  }

  async pollForNewBlock() {
    // here we init the polkadot rpc once for all processes
    if (!this.api) {
      await this.initPolkadotRPC()
    }

    // immediatly check and not wait the polling delay
    await this.checkForNewBlock()

    this.pollingTimeout = setTimeout(async () => {
      await this.checkForNewBlock()
      this.pollForNewBlock()
    }, POLLING_INTERVAL)
  }

  async pollForUpdateNetworks() {
    // gives us the control to modify network parameters
    this.store.updateNetworkFromDB()
    this.updateNetworksPollingTimeout = setTimeout(async () => {
      this.pollForUpdateNetworks()
    }, UPDATE_NETWORKS_POLLING_INTERVAL)
  }

  // For each block event, we fetch the block information and publish a message.
  // A GraphQL resolver is listening for these messages and sends the block to
  // each subscribed user.
  async newBlockHandler(blockHeight) {
    try {
      Sentry.configureScope(function (scope) {
        scope.setExtra('height', blockHeight)
      })

      const block = await this.polkadotAPI.getBlockByHeightV2(blockHeight)
      this.enqueueAndPublishBlockAdded(block)

      // gives us the control to modify network parameters
      this.store.updateNetworkFromDB()

      // We dont need to fetch validators on every new block.
      // Validator list only changes on new sessions
      if (
        this.currentSessionIndex < block.sessionIndex ||
        this.currentSessionIndex === 0
      ) {
        console.log(
          `\x1b[36mCurrent session index is ${block.sessionIndex}, fetching validators!\x1b[0m`
        )
        this.currentSessionIndex = block.sessionIndex
        const [sessionValidators, era] = await Promise.all([
          this.polkadotAPI.getAllValidators(),
          this.api.query.staking.activeEra().then(async (era) => {
            return era.toJSON().index
          })
        ])
        this.sessionValidators = sessionValidators

        if (this.currentEra < era || this.currentEra === 0) {
          console.log(
            `\x1b[36mCurrent staking era is ${era}, fetching rewards!\x1b[0m`
          )
          this.currentEra = era

          console.log(
            'Starting Polkadot rewards script on',
            config.scriptRunnerEndpoint
          )
          // runs async, we don't need to wait for this
          fetch(`${config.scriptRunnerEndpoint}/polkadotrewards`, {
            method: 'POST',
            headers: {
              Authorization: config.scriptRunnerAuthenticationToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              era,
              networkId: this.network.id
            })
          }).catch((error) => {
            console.error('Failed running Polkadot rewards script', error)
            Sentry.captureException(error)
          })
        }
      }

      await this.store.update({
        height: blockHeight,
        block,
        validators: this.sessionValidators,
        data: {
          era: this.currentEra
        }
      })

      // For each transaction listed in a block we extract the relevant addresses. This is published to the network.
      // A GraphQL resolver is listening for these messages and sends the
      // transaction to each subscribed user.
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
      console.error(`newBlockHandler failed`, error.message)
      Sentry.captureException(error)
    }
  }
}

module.exports = PolkadotNodeSubscription
