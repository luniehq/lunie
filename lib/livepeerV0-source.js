const { GraphQLDataSource } = require('./helpers/GraphQLDataSource')
const BigNumber = require('bignumber.js')

const LPT_CONVERSION = `1000000000000000000`

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
    rewardCut
    totalStake
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
        timestamp
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
      transcoders(where:{active:${active ? 'true' : 'false'}}) {
        ${this.validatorQueryString}
      }
    `
    )
    return transcoders
  }

  async getTotalStakedTokens(transcoders) {
    const totalStakedTokens = transcoders.reduce((sum, validator) => {
      return BigNumber(sum).plus(BigNumber(validator.totalStake))
    }, BigNumber(0))
    // LPT is represented by 1:1000000000000000000 internally
    return totalStakedTokens.div(LPT_CONVERSION)
  }

  async getAllValidators() {
    const inactiveTranscoders = await this.getValidators(false)
    const activeTranscoders = await this.getValidators(true)
    const totalStakedTokens = await this.getTotalStakedTokens(activeTranscoders)
    const transcoders = inactiveTranscoders.concat(activeTranscoders)
    return transcoders.map(validator =>
      this.reducers.validatorReducer(
        this.networkId,
        validator,
        totalStakedTokens
      )
    )
  }

  async getSelfStake() {
    return undefined
  }

  getExpectedReturns(validator) {
    return this.reducers.livepeerExpectedRewardsReducer({
      rewardCut: validator.rewardCut,
      // assuming following fixed values which is not true and needs to be queried via the future  protocol query
      inflation: 1172, // TODO change to API call
      inflationChange: 3, // TODO change to API call
      totalSupply: '17919760877408440511808797', // TODO change to API call
      totalStaked: '11426550355221975909835117' // TODO change to API call
    })
  }
}

module.exports = LivepeerV0API
module.exports.LPT_CONVERSION = LPT_CONVERSION
