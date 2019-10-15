const { RESTDataSource } = require('apollo-datasource-rest')
const chainpubsub = require('./chain-pubsub')
const BigNumber = require('bignumber.js')
const _ = require('lodash')
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
    this.subscribeToBlocks(network)
  }

  // subscribe to blocks via Tendermint
  async subscribeToBlocks(network) {
    this.wsClient = await chainpubsub.client(network.rpc_url)
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
      result: { bonded_tokens: totalBondedTokens }
    } = await this.get('/staking/pool')
    if (!Array.isArray(response.result)) return []
    const proposals = await Promise.all(
      response.result.map(async proposal => {
        return proposalReducer(proposal, totalBondedTokens)
      })
    )
    return _.orderBy(proposals, 'id', 'desc')
  }

  async getAllValidators() {
    const response = await this.get('staking/validators')
    return Array.isArray(response.result)
      ? response.result.map(validator => validatorReducer(validator))
      : []
  }

  async getValidatorByAddress(operatorAddress) {
    const response = await this.get(`staking/validators/${operatorAddress}`)
    return validatorReducer(response.result)
  }

  async getProposalById({ proposalId }) {
    const response = await this.get(`gov/proposals/${proposalId}`)
    return proposalReducer(response.result)
  }

  async getGovernanceParameters() {
    const { result: depositParameters } = await this.get(
      `gov/parameters/deposit`
    )
    const { result: tallyingParamers } = await this.get(
      `gov/parameters/tallying`
    )
    return {
      votingThreshold: tallyingParamers.threshold,
      vetoThreshold: tallyingParamers.veto,
      // for now assuming one deposit denom
      depositDenom: 'STAKE',
      depositThreshold: BigNumber(depositParameters.min_deposit[0].amount).div(
        1000000
      )
    }
  }

  async getDelegatorVote({ proposalId, address }) {
    const response = await this.get(`gov/proposals/${proposalId}/votes`)
    const votes = response.result || []
    const vote = votes.find(({ voter }) => voter === address) || {}
    return {
      option: vote.option
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
