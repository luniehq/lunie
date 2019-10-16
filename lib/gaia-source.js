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
const { expectedReturns, calculateTokens, pubkeyToAddress } = require('./tools')

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

  async getAllValidatorSets() {
    const response = await this.get(`validatorsets/latest`)
    return response.result
  }

  async getValidatorSigningInfo(validatorConsensusPubKey) {
    try {
      const exceptions = [
        `cosmosvalconspub1zcjduepqx38v580cmd9em3n7mcgzj22jwdwks5lr3lfxl8g87vzjp7jyyszsr4xvzv`,
        `cosmosvalconspub1zcjduepqlzmd0spn9m0m3eq9zp93d4w6e5tugamv44yqjzyacelnvra634fqnfec0r`
      ]
      if (exceptions.indexOf(validatorConsensusPubKey) !== -1) {
        console.log(`Ignore Validator ${validatorConsensusPubKey}`)
        throw Error()
      }
      const response = await this.get(
        `slashing/validators/${validatorConsensusPubKey}/signing_info`
      )
      return response.result
    } catch (e) {
      return {
        missed_blocks_counter: '0',
        start_height: '0'
      }
    }
  }

  async getAnnualProvision() {
    const response = await this.get(`minting/annual-provisions`)
    return response.result
  }

  async getAllValidators() {
    const [validators, annualProvision, validatorSet] = await Promise.all([
      Promise.all([
        this.get(`staking/validators?status=unbonding`),
        this.get(`staking/validators?status=bonded`),
        this.get(`staking/validators?status=unbonded`)
      ])
        .then(responses => responses.map(({ result }) => result))
        .then(validatorGroups => [].concat(...validatorGroups)),
      this.getAnnualProvision(),
      this.getAllValidatorSets()
    ])

    // create a dictionary to reduce array lookups
    const consensusValidators = validatorSet.validators.reduce(
      (dictionary, consensusValidator) => {
        dictionary[consensusValidator.address] = consensusValidator
        return dictionary
      },
      {}
    )
    const totalVotingPower = validatorSet.validators.reduce(
      (sum, { voting_power }) => sum.plus(voting_power),
      BigNumber(0)
    )

    validators.forEach(validator => {
      const consensusAddress = pubkeyToAddress(validator.consensus_pubkey)
      validator.voting_power = consensusValidators[consensusAddress]
        ? BigNumber(consensusValidators[consensusAddress].voting_power).div(
            totalVotingPower
          )
        : 0
      validator.expected_returns = expectedReturns(validator, annualProvision)
    })

    // query for signing info
    await Promise.all(
      validators.map(validator =>
        this.getValidatorSigningInfo(validator.consensus_pubkey)
      )
    ).then(singingInfos => {
      singingInfos.forEach((signingInfo, index) => {
        validators[index].signing_info = signingInfo
      })
    })

    return validators.map(validator => validatorReducer(validator))
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
