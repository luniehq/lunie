const _ = require('lodash')
const { ApiPromise, WsProvider } = require('@polkadot/api')
const {
  publishBlockAdded
  // publishUserTransactionAdded,
  // publishEvent: publishEvent
} = require('../subscriptions')
const Sentry = require('@sentry/node')
const database = require('../database')
const config = require('../../config.js')

const POLLING_INTERVAL = 1000
// const NEW_BLOCK_DELAY = 2000

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
    this.blockQueue = []
    this.subscribeForNewBlock()
  }

  // here we init the polkadot rpc once for all processes
  // the class gets stored in the store to be used by all instances
  async initPolkadotRPC() {
    this.api = new ApiPromise({
      provider: new WsProvider(this.network.rpc_url)
    })
    this.store.polkadotRPC = this.api
    await this.api.isReady
  }

  async subscribeForNewBlock() {
    // here we init the polkadot rpc once for all processes
    if (!this.api) {
      await this.initPolkadotRPC()
    }

    // Subscribe to new block headers
    await this.api.rpc.chain.subscribeNewHeads(async blockHeader => {
      const blockHeight = blockHeader.number.toNumber()
      if (this.height < blockHeight) {
        this.height = blockHeight
        console.log(`\x1b[36mNew kusama block #${blockHeight}\x1b[0m`)
        this.newBlockHandler(blockHeight)
      }
    })
  }

  // Sometimes blocks get published unordered so we need to enqueue
  // them before publish to ensure correct order. This adds 3 blocks delay.
  enqueueAndPublishBlockAdded(newBlock) {
    this.blockQueue.push(newBlock)
    if (this.blockQueue.length > 2) {
      this.blockQueue = this.blockQueue.sort((a, b) => a.height - b.height)
      console.log(
        `\x1b[36mPublishing new kusama block #${this.blockQueue[0].height}\x1b[0m`
      )
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
        console.log(`New kusama block #${this.height}`)
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

  // For each block event, we fetch the block information and publish a message.
  // A GraphQL resolver is listening for these messages and sends the block to
  // each subscribed user.
  async newBlockHandler(blockHeight) {
    try {
      Sentry.configureScope(function(scope) {
        scope.setExtra('height', blockHeight)
      })

      const block = await this.polkadotAPI.getBlockByHeight(blockHeight)
      this.enqueueAndPublishBlockAdded(block)

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
        this.sessionValidators = await this.polkadotAPI.getAllValidators()
      }

      this.updateDBValidatorProfiles(this.sessionValidators)
      this.store.update({
        height: blockHeight,
        block,
        validators: this.getValidatorMap(this.sessionValidators)
      })

      // For each transaction listed in a block we extract the relevant addresses. This is published to the network.
      // A GraphQL resolver is listening for these messages and sends the
      // transaction to each subscribed user.

      // let addresses = []
      // addresses = this.polkadotAPI.extractInvolvedAddresses(block.transactions)
      // addresses = _.uniq(addresses)

      // if (addresses.length > 0) {
      //   console.log(
      //     `\x1b[36mAddresses included in tx for block #${blockHeight}: ${addresses}\x1b[0m`
      //   )
      // }

      // addresses.forEach(address => {
      //   publishUserTransactionAdded(this.network.id, address, tx)
      //   publishEvent(this.network.id, 'transaction', address, tx)
      // })
    } catch (error) {
      console.error(`newBlockHandler failed`, JSON.stringify(error, null, 2))
      Sentry.captureException(error)
    }
  }

  getValidatorMap(validators) {
    const validatorMap = _.keyBy(validators, 'operatorAddress')
    return validatorMap
  }

  // this adds all the validator addresses to the database so we can easily check in the database which ones have an image and which ones don't
  async updateDBValidatorProfiles(validators) {
    // filter only new validators
    let newValidators = validators.filter(
      validator =>
        !this.validators.find(
          v =>
            v.address == validator.operatorAddress && v.name == validator.name // in case if validator name was changed
        )
    )
    // save all new validators to an array
    this.validators = [
      ...this.validators.filter(
        ({ operatorAddress }) =>
          !newValidators.find(
            ({ operatorAddress: newValidatorOperatorAddress }) =>
              newValidatorOperatorAddress === operatorAddress
          )
      ),
      ...newValidators.map(v => ({
        address: v.operatorAddress,
        name: v.name
      }))
    ]
    // update only new onces
    const validatorRows = newValidators.map(
      ({ operatorAddress, name, chainId }) => ({
        operator_address: operatorAddress,
        name,
        chain_id: chainId
      })
    )
    return this.db.upsert('validatorprofiles', validatorRows)
  }
}

module.exports = PolkadotNodeSubscription
