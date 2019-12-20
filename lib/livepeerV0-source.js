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
    // LPT and all Ethereum units are represented by 1:1000000000000000000 internally
    return totalStakedTokens.div(LPT_CONVERSION)
  }

  async getAllValidators() {
    const inactiveTranscoders = await this.getValidators(false)
    const activeTranscoders = await this.getValidators(true)
    const globals = await this.getGlobalValues()
    const totalStakedTokens = await this.getTotalStakedTokens(activeTranscoders)
    const transcoders = inactiveTranscoders.concat(activeTranscoders)
    return transcoders.map(validator =>
      this.reducers.validatorReducer(
        this.networkId,
        validator,
        totalStakedTokens,
        globals
      )
    )
  }

  async getSelfStake(validator) {
    const { delegators } = await this.query(
      `
      delegators(where:{id:"${validator.operatorAddress}"}) {
        id
        pendingStake
      }
      `
    )
    return BigNumber(delegators[0].pendingStake).div(LPT_CONVERSION)
  }

  async getGlobalValues() {
    const { protocol } = await this.query(
      `
      protocol {
        inflation
        inflationChange
        totalTokenSupply
        totalBondedToken
      }
      `
    )
    return protocol
  }

  async getExpectedReturns(validator) {
    return this.reducers.livepeerExpectedRewardsReducer({
      rewardCut: validator.rewardCut,
      inflation: validator.globals.inflation,
      inflationChange: validator.globals.inflationChange,
      totalSupply: BigNumber(validator.globals.totalTokenSupply).div(
        LPT_CONVERSION
      ),
      totalStaked: BigNumber(validator.globals.totalBondedToken).div(
        LPT_CONVERSION
      )
    })
  }
}

module.exports = LivepeerV0API
module.exports.LPT_CONVERSION = LPT_CONVERSION
