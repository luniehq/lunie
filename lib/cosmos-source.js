const { RESTDataSource } = require('apollo-datasource-rest')
const BigNumber = require('bignumber.js')
const _ = require('lodash')
const chainpubsub = require('./chain-pubsub')
const {
  proposalReducer,
  validatorReducer,
  blockReducer,
  balanceReducer,
  delegationReducer,
  coinReducer,
  transactionReducer
} = require('./reducers/cosmos-reducers')
const { uniqWith, sortBy, reverse } = require('lodash')
const { expectedReturns, calculateTokens, pubkeyToAddress } = require('./tools')

class CosmosAPI extends RESTDataSource {
  constructor(network) {
    super()
    this.baseURL = network.api_url
    this.initialize({})
    this.subscribeToBlocks(network)

    // cache
    this.singingInfosCache = undefined
    this.singingInfosCacheUpdate = undefined
    // prepopulate cache
    this.getValidatorSigningInfos()
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

  async getValidatorSigningInfos() {
    // if the last update is younger then 1 minute, serve the cache
    if (
      this.singingInfosCacheUpdate !== undefined &&
      new Date().getTime() - this.singingInfosCacheUpdate.getTime() < 60 * 1000
    ) {
      return this.singingInfosCache
    }

    const validators = await Promise.all([
      this.get(`staking/validators?status=unbonding`),
      this.get(`staking/validators?status=bonded`),
      this.get(`staking/validators?status=unbonded`)
    ]).then(validatorGroups => [].concat(...validatorGroups))

    const signingInfos = await Promise.all(
      validators.map(({ consensus_pubkey }) =>
        this.getValidatorSigningInfo(consensus_pubkey)
      )
    )

    this.singingInfosCache = signingInfos
    this.singingInfosCacheUpdate = new Date()
    return signingInfos
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
      return {
        address: pubkeyToAddress(validatorConsensusPubKey),
        ...response
      }
    } catch (e) {
      return {
        address: pubkeyToAddress(validatorConsensusPubKey),
        missed_blocks_counter: '0',
        start_height: '0'
      }
    }
  }

  async getAllValidatorSets() {
    const response = await this.get(`validatorsets/latest`)
    return response
  }

  async getAllValidators() {
    const [validators, annualProvision, validatorSet] = await Promise.all([
      Promise.all([
        this.get(`staking/validators?status=unbonding`),
        this.get(`staking/validators?status=bonded`),
        this.get(`staking/validators?status=unbonded`)
      ]).then(validatorGroups => [].concat(...validatorGroups)),
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

    // query for signing info
    const signingInfos = _.keyBy(
      await this.getValidatorSigningInfos(),
      'address'
    )

    validators.forEach(validator => {
      const consensusAddress = pubkeyToAddress(validator.consensus_pubkey)
      validator.voting_power = consensusValidators[consensusAddress]
        ? BigNumber(consensusValidators[consensusAddress].voting_power).div(
            totalVotingPower
          )
        : 0
      validator.expected_returns = expectedReturns(validator, annualProvision)
      validator.signing_info = signingInfos[consensusAddress]
    })

    return validators.map(validator => validatorReducer(validator))
  }

  async getValidatorByAddress(operatorAddress) {
    const response = await this.get(`staking/validators/${operatorAddress}`)
    const signingInfo = await this.getValidatorSigningInfo(
      response.consensus_pubkey
    )
    response.signing_info = signingInfo
    return validatorReducer(response)
  }

  async getAllProposals() {
    const response = await this.get('gov/proposals')
    const { bonded_tokens: totalBondedTokens } = await this.get('/staking/pool')
    if (!Array.isArray(response)) return []
    const proposals = await Promise.all(
      response.map(async proposal => {
        return proposalReducer(proposal, totalBondedTokens)
      })
    )
    return _.orderBy(proposals, 'id', 'desc')
  }

  async getProposalById({ proposalId }) {
    const response = await this.get(`gov/proposals/${proposalId}`)
    const { bonded_tokens: totalBondedTokens } = await this.get('/staking/pool')
    return proposalReducer(response, totalBondedTokens)
  }

  async getGovernanceParameters() {
    const depositParameters = await this.get(`gov/parameters/deposit`)
    const tallyingParamers = await this.get(`gov/parameters/tallying`)
    return {
      votingThreshold: tallyingParamers.threshold,
      vetoThreshold: tallyingParamers.veto,
      // for now assuming one deposit denom
      depositDenom: 'ATOM',
      depositThreshold: BigNumber(depositParameters.min_deposit[0].amount).div(
        1000000
      )
    }
  }

  async getDelegatorVote({ proposalId, address }) {
    const response = await this.get(`gov/proposals/${proposalId}/votes`)
    const votes = response || []
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
    let delegations =
      (await this.get(`staking/delegators/${address}/delegations`)) || []
    delegations = await Promise.all(
      delegations.map(async delegation => {
        const validator = await this.getValidatorByAddress(
          delegation.validator_address
        )
        return {
          ...delegation,
          // in gaiav0 we need to convert shares (gaia internal representation) to token balance
          balance: calculateTokens(validator, delegation.shares)
        }
      })
    )
    return delegations.map(delegation => delegationReducer(delegation))
  }

  async getDelegationForValidator(delegatorAddress, operatorAddress) {
    try {
      const response = await this.get(
        `staking/delegators/${delegatorAddress}/delegations/${operatorAddress}`
      )
      const validator = await this.getValidatorByAddress(operatorAddress)
      response.tokens = calculateTokens(validator, response.shares)
      return delegationReducer(response)
    } catch (e) {
      return delegationReducer({ error: true })
    }
  }

  async getAnnualProvision() {
    const response = await this.get(`minting/annual-provisions`)
    return response
  }

  async getRewards(delegatorAddress, operatorAddress) {
    let fetchURL
    if (delegatorAddress && operatorAddress) {
      fetchURL = `distribution/delegators/${delegatorAddress}/rewards/${operatorAddress}`
    } else if (delegatorAddress) {
      fetchURL = `distribution/delegators/${delegatorAddress}/rewards`
    } else if (operatorAddress) {
      fetchURL = `distribution/validators/${operatorAddress}/rewards`
    } else {
      return
    }

    try {
      const response = await this.get(fetchURL)
      return Array.isArray(response)
        ? response.map(validator => coinReducer(validator))
        : []
    } catch (e) {
      return []
    }
  }

  async getValidatorDelegations(operatorAddress) {
    const response = await this.get(
      `staking/validators/${operatorAddress}/delegations`
    )

    return Array.isArray(response)
      ? response.map(proposal => delegationReducer(proposal))
      : []
  }

  async getTransactions(address) {
    const txs = await Promise.all([
      this.get(`/txs?sender=${address}`),
      this.get(`/txs?recipient=${address}`),
      // this.get(`/txs?action=submit_proposal&proposer=${address}`),
      this.get(`/txs?action=deposit&depositor=${address}`),
      this.get(`/txs?action=vote&voter=${address}`),
      // this.get(`/txs?action=create_validator&destination-validator=${valAddress}`), // TODO
      // this.get(`/txs?action=edit_validator&destination-validator=${valAddress}`), // TODO
      this.get(`/txs?action=delegate&delegator=${address}`),
      this.get(`/txs?action=begin_redelegate&delegator=${address}`),
      this.get(`/txs?action=begin_unbonding&delegator=${address}`),
      // this.get(`/txs?action=unjail&source-validator=${address}`), // TODO
      // this.get(`/txs?action=set_withdraw_address&delegator=${address}`), // other
      this.get(`/txs?action=withdraw_delegator_reward&delegator=${address}`),
      this.get(
        `/txs?action=withdraw_validator_rewards_all&source-validator=${address}`
      )
    ]).then(transactionGroups => [].concat(...transactionGroups))

    const dupFreeTxs = uniqWith(txs, (a, b) => a.txhash === b.txhash)
    const sortedTxs = sortBy(dupFreeTxs, ['timestamp'])
    const reversedTxs = reverse(sortedTxs)
    return reversedTxs.map(transactionReducer)
  }
}

module.exports = CosmosAPI
