const _ = require('lodash')
const { ApiPromise, WsProvider } = require('@polkadot/api')
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
const { spawn } = require('child_process')

const POLLING_INTERVAL = 1000
// const NEW_BLOCK_DELAY = 2000
// const DISCONNECTION_INTERVAL = 1000 * 60 * 60 * 6 // used to disconnect from API to free memory

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
  }

  // here we init the polkadot rpc once for all processes
  // the class gets stored in the store to be used by all instances
  async initPolkadotRPC() {
    this.api = new ApiPromise({
      provider: new WsProvider(this.network.rpc_url)
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
        this.newBlockHandler(blockHeight)
      }

      // refresh the api to prevent memory leaks
      // if (Date.now() - this.store.polkadotRPCOpened > DISCONNECTION_INTERVAL) {
      //   console.log(
      //     'Disconnecting Polkadot for network',
      //     this.network.id,
      //     'to avoid memory leaks'
      //   )
      //   this.api.disconnect()
      //   this.api = undefined
      //   await this.initPolkadotRPC()
      // }
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

          const rewardsScript = spawn(
            'node',
            [
              'scripts/getOldPolkadotRewardEras.js',
              `--currentEra=${this.currentEra}`
            ],
            {
              stdio: 'inherit' //feed all child process logging into parent process
            }
          )
          rewardsScript.on('close', function (code) {
            process.stdout.write(
              'rewardsScript finished with code ' + code + '\n'
            )

            if (code !== 0) {
              Sentry.captureException(
                new Error('getOldPolkadotRewardEras script failed')
              )
            }
          })
        }
      }

      this.updateDBValidatorProfiles(this.sessionValidators)
      this.store.update({
        height: blockHeight,
        block,
        validators: this.getValidatorMap(this.sessionValidators),
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

  getValidatorMap(validators) {
    const validatorMap = _.keyBy(validators, 'operatorAddress')
    return validatorMap
  }

  // this adds all the validator addresses to the database so we can easily check in the database which ones have an image and which ones don't
  async updateDBValidatorProfiles(validators) {
    // filter only new validators
    let newValidators = validators.filter(
      (validator) =>
        !this.validators.find(
          (v) =>
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
      ...newValidators.map((v) => ({
        address: v.operatorAddress,
        name: v.name
      }))
    ]
    // update only new ones
    const validatorRows = newValidators.map(
      ({ operatorAddress, name, chainId }) => ({
        operator_address: operatorAddress,
        name,
        chain_id: chainId
      })
    )
    return this.db.upsert('validatorprofiles', validatorRows)
  }
  async updateRewards(era, chainId) {
    console.time()
    console.log('update rewards')
    const rewards = await this.polkadotAPI.getEraRewards(era) // ATTENTION: era means "get all rewards of all eras since that era". putting a low number takes a long time.
    console.timeEnd()

    console.time()
    console.log('store rewards', rewards.length)
    await this.storeRewards(
      rewards
        .filter(({ amount }) => amount > 0)
        .map(({ amount, height, validatorAddress, denom, address }) => ({
          amount,
          height,
          validator: validatorAddress,
          denom,
          address
        })),
      era,
      chainId
    )
    console.timeEnd()
  }

  storeRewards(rewards, chainId) {
    return this.db.insert('rewards', rewards, undefined, chainId) // height is in the rewards rows already
  }

  async eraRewardsExist(era) {
    const response = await this.db.read(
      'rewards',
      'rewardsExitCheck',
      ['amount'],
      `limit:1 where:{height:{_eq:"${era}"}}`
    )
    return response.length > 0
  }
}

module.exports = PolkadotNodeSubscription
