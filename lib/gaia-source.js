const { RESTDataSource } = require('apollo-datasource-rest')
const chainpubsub = require('./chain-pubsub')
const {
  proposalReducer,
  validatorReducer,
  blockReducer,
  balanceReducer,
  delegationReducer
} = require('./reducers/gaia-reducers')

class GaiaAPI extends RESTDataSource {
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

  async getAllProposals() {
    const response = await this.get('gov/proposals')
    const {
      result: { bond_denom: bondDenom }
    } = await this.get('staking/parameters')
    return Array.isArray(response.result)
      ? Promise.all(
          response.result.map(async proposal => {
            return proposalReducer(proposal, bondDenom)
          })
        )
      : []
  }

  async getAllValidators() {
    const response = await this.get('staking/validators')
    return Array.isArray(response.result)
      ? response.result.map(validator => validatorReducer(validator))
      : []
  }

  async getValidatorByAddress({ address }) {
    const response = await this.get(`staking/validators/${address}`)
    return validatorReducer(response.result)
  }

  async getProposalById({ proposalId }) {
    const response = await this.get(`gov/proposals/${proposalId}`)
    const {
      result: { bond_denom: bondDenom }
    } = await this.get('staking/parameters')
    return proposalReducer(response.result, bondDenom)
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

  async getDelegationsForAddress(address) {
    const response = await this.get(`staking/delegators/${address}/delegations`)
    return Array.isArray(response.result)
      ? response.result.map(proposal => delegationReducer(proposal))
      : []
  }

  async getDelegationForValidator(delegatorAddress, validatorAddress) {
    const response = await this.get(
      `staking/delegators/${delegatorAddress}/delegations/${validatorAddress}`
    )
    return delegationReducer(response.result)
  }
}

module.exports = GaiaAPI
