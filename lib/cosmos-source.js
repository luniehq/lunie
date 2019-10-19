const { RESTDataSource } = require('apollo-datasource-rest')
const BigNumber = require('bignumber.js')
const _ = require('lodash')
const chainpubsub = require('./chain-pubsub')
const {
  proposalReducer,
  validatorReducer,
  blockReducer,
  delegationReducer,
  coinReducer,
  undelegationReducer,
  overviewReducer,
  metadataReducer,
  transactionReducer,
  rewardReducer
} = require('./reducers/cosmos-reducers')
const { uniqWith, sortBy, reverse } = require('lodash')
const {
  encodeB32,
  decodeB32,
  expectedReturns,
  pubkeyToAddress
} = require('./tools')

class CosmosAPI extends RESTDataSource {
  constructor(network) {
    super()
    this.baseURL = network.api_url
    this.initialize({})
    this.subscribeToBlocks(network)
    this.loadStaticData()

    // prepopulate cache
    this.getAllValidators()
  }

  async loadStaticData() {
    this.stakingDenom = (await this.get('/staking/parameters')).bond_denom
    // this.depositDenom = (await this.get("/gov/parameters/deposit")).min_deposit[0].denom
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

  async getValidatorSigningInfos(validators) {
    const signingInfos = await Promise.all(
      validators.map(({ consensus_pubkey }) =>
        this.getValidatorSigningInfo(consensus_pubkey)
      )
    )

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
        `slashing/validators/${validatorConsensusPubKey}/signing_info`,
        { cacheOptions: { ttl: 60 } }
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
    let [validators, annualProvision, validatorSet] = await Promise.all([
      Promise.all([
        this.get(`staking/validators?status=unbonding`),
        this.get(`staking/validators?status=bonded`),
        this.get(`staking/validators?status=unbonded`)
      ]).then(validatorGroups => [].concat(...validatorGroups)),
      this.getAnnualProvision(),
      this.getAllValidatorSets()
    ])

    // create a dictionary to reduce array lookups
    const consensusValidators = _.keyBy(validatorSet.validators, 'address')
    const totalVotingPower = validatorSet.validators.reduce(
      (sum, { voting_power }) => sum.plus(voting_power),
      BigNumber(0)
    )

    // query for signing info
    const signingInfos = _.keyBy(
      await this.getValidatorSigningInfos(validators),
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

  async getValidatorByAddress(wantedOperatorAddress) {
    const hexDelegatorAddressFromOperator = decodeB32(wantedOperatorAddress)
    const delegatorAddressFromOperator = encodeB32(
      hexDelegatorAddressFromOperator,
      `cosmos`
    )

    const [validators, selfDelegation] = await Promise.all([
      this.getAllValidators(),
      this.get(
        `staking/delegators/${delegatorAddressFromOperator}/delegations/${wantedOperatorAddress}`
      )
    ])
    const validator = validators.find(
      ({ operatorAddress }) => operatorAddress === wantedOperatorAddress
    )

    validator.selfStake = delegationReducer(selfDelegation, validator).amount

    return validator
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
    return response.map(coinReducer)
  }

  async getDelegationsForDelegatorAddress(address) {
    let delegations =
      (await this.get(`staking/delegators/${address}/delegations`)) || []
    const validators = await this.getAllValidators()
    const validatorsDictionary = _.keyBy(validators, 'operatorAddress')

    return delegations.map(delegation =>
      delegationReducer(
        delegation,
        validatorsDictionary[delegation.validator_address]
      )
    )
  }

  async getUndelegationsForDelegatorAddress(address) {
    let undelegations =
      (await this.get(`staking/delegators/${address}/unbonding_delegations`)) ||
      []
    const validators = await this.getAllValidators()
    const validatorsDictionary = _.keyBy(validators, 'operatorAddress')

    // undelegations come in a nested format { validator_address, delegator_address, entries }
    // we flatten the format to be able to easier iterate over the list
    const flattenedUndelegations = undelegations.reduce(
      (list, undelegation) =>
        list.concat(
          undelegation.entries.map(entry => ({
            validator_address: undelegation.validator_address,
            delegator_address: undelegation.delegator_address,
            balance: entry.balance,
            completion_time: entry.completion_time,
            creation_height: entry.creation_height,
            initial_balance: entry.initial_balance
          }))
        ),
      []
    )
    return flattenedUndelegations.map(undelegation =>
      undelegationReducer(
        undelegation,
        validatorsDictionary[undelegation.validator_address]
      )
    )
  }

  async getDelegationForValidator(delegatorAddress, operatorAddress) {
    const [delegation, validator] = await Promise.all([
      this.get(
        `staking/delegators/${delegatorAddress}/delegations/${operatorAddress}`
      ),
      this.getValidatorByAddress(operatorAddress)
    ])
    return delegationReducer(delegation, validator)
  }

  async getAnnualProvision() {
    const response = await this.get(`minting/annual-provisions`)
    return response
  }

  async getRewards(delegatorAddress, delegations) {
    if (!delegations) {
      delegations = await this.getDelegationsForDelegatorAddress(
        delegatorAddress
      )
    }
    const rewards = await Promise.all(
      delegations.map(async ({ validatorAddress, validator }) => ({
        validator,
        rewards: await this.get(
          `distribution/delegators/${delegatorAddress}/rewards/${validatorAddress}`
        )
      }))
    )
    return rewards.map(({ rewards, validator }) =>
      rewardReducer(rewards[0], validator)
    )
  }

  async getOverview(delegatorAddress) {
    const [balances, delegations] = await Promise.all([
      this.getBalanceFromAddress(delegatorAddress),
      this.getDelegationsForDelegatorAddress(delegatorAddress)
    ])
    const rewards = await this.getRewards(delegatorAddress, delegations)
    return overviewReducer(balances, delegations, rewards, this.stakingDenom)
  }

  async getMetaData() {
    return metadataReducer(this.stakingDenom)
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
