const { RESTDataSource } = require('apollo-datasource-rest')
const BigNumber = require('bignumber.js')
const chainpubsub = require('./chain-pubsub')
const {
  proposalReducer,
  validatorReducer,
  blockReducer,
  balanceReducer,
  delegationReducer
} = require('./reducers/cosmos-reducers')

class CosmosAPI extends RESTDataSource {
  constructor(network) {
    super()
    this.baseURL = network.api_url
    this.initialize({})
    this.wsClient = chainpubsub.client(network.rpc_url)
    this.wsClient.subscribe({ query: "tm.event='NewBlock'" }, async event => {
      const block = await this.getBlockByHeight({
        blockHeight: event.block.header.height
      })
      chainpubsub.publishBlockAdded(network.id, block)
    })
  }

  async getAllValidators() {
    const response = await this.get('staking/validators')
    return Array.isArray(response)
      ? response.map(validator => validatorReducer(validator))
      : []
  }

  async getValidatorByAddress({ address }) {
    const response = await this.get(`staking/validators/${address}`)
    return validatorReducer(response)
  }

  async getAllProposals() {
    const response = await this.get('gov/proposals')
    const { bond_denom: bondDenom } = await this.get('staking/parameters')
    return Array.isArray(response)
      ? Promise.all(
          response.map(async proposal => {
            return proposalReducer(proposal, bondDenom)
          })
        )
      : []
  }

  async getProposalById({ proposalId }) {
    const response = await this.get(`gov/proposals/${proposalId}`)
    const { bond_denom: bondDenom } = await this.get('staking/parameters')
    return proposalReducer(response, bondDenom)
  }

  async getGovernanceParameters() {
    const { bond_denom: bondDenom } = await this.get('staking/parameters')
    const depositParameters = await this.get(`gov/parameters/deposit`)
    const tallyingParamers = await this.get(`gov/parameters/tallying`)
    return {
      votingThreshold: tallyingParamers.threshold,
      vetoThreshold: tallyingParamers.veto,
      depositThreshold: BigNumber(
        depositParameters.min_deposit.find(({ denom }) => denom === bondDenom)
          .amount
      ).div(1000000)
    }
  }

  async getBlockByHeight({ blockHeight }) {
    let response
    if (blockHeight) {
      response = await this.get(`blocks/${blockHeight}`)
    } else {
      response = await this.get(`blocks/latest`)
    }
    return blockReducer(response)
  }

  async getBalanceFromAddress(address) {
    const response = await this.get(`bank/balances/${address}`)
    return balanceReducer(response)
  }

  async getDelegationsForDelegatorAddress(address) {
    const response = await this.get(`staking/delegators/${address}/delegations`)
    return Array.isArray(response)
      ? response.map(proposal => delegationReducer(proposal))
      : []
  }

  async getDelegationForValidator(delegatorAddress, validatorAddress) {
    const response = await this.get(
      `staking/delegators/${delegatorAddress}/delegations/${validatorAddress}`
    )
    return delegationReducer(response)
  }
}

module.exports = CosmosAPI
