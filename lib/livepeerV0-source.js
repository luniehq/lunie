const { GraphQLDataSource } = require('./helpers/GraphQLDataSource')
const BigNumber = require('bignumber.js')
const _ = require('lodash')

class LivepeerV0API extends GraphQLDataSource {
  constructor(network) {
    super(network.api_url)
    this.initialize({})
    this.setReducers()
    this.networkId = network.id
    this.validatorQueryString = `
    id
    active
    status
    lastRewardRound {
      id
    }
    rewardCut
    feeShare
    pricePerSegment
    pendingRewardCut
    pendingFeeShare
    pendingPricePerSegment
    totalStake
    delegators {
      id
      bondedAmount
    }
    `
  }

  setReducers() {
    this.reducers = require('./reducers/livepeerV0-reducers')
  }

  async getBlockByHeight({ blockHeight }) {
    if (!blockHeight) {
      const { transcoders } = await this.query(
        `
        transcoders(where: {active: true}, first: 1) {
          lastRewardRound {id}
        }
        `
      )
      blockHeight = JSON.parse(transcoders[0].lastRewardRound.id)
    }
    const { rounds } = await this.query(
      `
      rounds(where: { id: ${blockHeight} }) {
        id
        initialized
        length
        timestamp
        lastInitializedRound
        startBlock
        mintableTokens
      }
    `
    )
    return this.reducers.blockReducer(this.networkId, rounds[0])
  }

  async getLastBlockHeight() {
    const { transcoders } = await this.query(
      `
      transcoders(first: 1, where: {active: true}) {
        id
        lastRewardRound {
          id
        }
      }
    `
    )
    return parseInt(transcoders[0].lastRewardRound.id)
  }

  async getValidators(active) {
    const { transcoders } = await this.query(
      `
      transcoders(where: {active: ${active}, status_not: null}) {
        ${this.validatorQueryString}
      }
    `
    )
    return transcoders
  }

  async getTotalStakedTokens(transcoders) {
    let totalStakedTokens = 0
    transcoders.forEach(validator => {
      totalStakedTokens = BigNumber(totalStakedTokens)
        .plus(BigNumber(validator.totalStake))
        .plus(BigNumber(validator.totalDelegatorsStake))
    })
    return totalStakedTokens.div('10000000000000000')
  }

  async getDelegatorsStake(validator) {
    let totalDelegatorsStake = 0
    validator.delegators.forEach(delegator => {
      totalDelegatorsStake = BigNumber(totalDelegatorsStake).plus(
        BigNumber(delegator.bondedAmount)
      )
    })
    validator = {
      ...validator,
      totalDelegatorsStake: totalDelegatorsStake.toString()
    }
    return validator
  }

  async getValidator(id) {
    const { transcoder } = await this.query(
      `
    transcoders(where: { id: ${id} }) {
      ${this.validatorQueryString}
    }
    `
    )
    return this.reducers.validatorReducer(transcoder)
  }

  async getAllValidators() {
    // Until they fix their API we need to query separately for active and inactive validators
    const inactiveTranscoders = await this.getValidators(false)
    const activeTranscoders = await this.getValidators(true)
    const transcoders = _.union(inactiveTranscoders, activeTranscoders)
    const modTranscoders = await Promise.all(
      transcoders.map(
        async validator => await this.getDelegatorsStake(validator)
      )
    )
    const totalStakedTokens = await this.getTotalStakedTokens(modTranscoders)
    return modTranscoders.map(validator =>
      this.reducers.validatorReducer(
        this.networkId,
        validator,
        totalStakedTokens
      )
    )
  }

  async getSelfStake(validator) {
    return validator.selfStake
  }
}

module.exports = LivepeerV0API
