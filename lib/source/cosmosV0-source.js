const { RESTDataSource } = require('apollo-datasource-rest')
const BigNumber = require('bignumber.js')
const _ = require('lodash')
const { uniqWith, sortBy, reverse } = require('lodash')
const { encodeB32, decodeB32, pubkeyToAddress } = require('../tools')
const { UserInputError } = require('apollo-server')

class CosmosV0API extends RESTDataSource {
  constructor(network) {
    super()
    this.baseURL = network.api_url
    this.initialize({})
    this.networkId = network.id
    this.networkTitle = network.title
    this.delegatorBech32Prefix = network.address_prefix
    this.validatorConsensusBech32Prefix = `${network.address_prefix}valcons`

    this.setReducers()
  }

  setReducers() {
    this.reducers = require('../reducers/cosmosV0-reducers')
  }

  // querying data from the cosmos REST API
  // is overwritten in cosmos v2 to extract from a differnt result format
  // some endpoints /blocks and /txs have a different response format so they use this.get directly
  async query(url) {
    return this.get(url)
  }

  async getStakinDenom() {
    const stakingParameters = await this.query('/staking/parameters')
    return stakingParameters.bond_denom
  }

  async getSignedBlockWindow() {
    const slashingParams = await this.query('/slashing/parameters')
    return slashingParams.signed_blocks_window
  }

  extractInvolvedAddresses(transaction) {
    // If the transaction has failed, it doesn't get tagged
    if (!Array.isArray(transaction.tags)) return []

    const involvedAddresses = transaction.tags.reduce((addresses, tag) => {
      // temporary in here to identify why this fails
      if (!tag.value) {
        return addresses
      }
      if (tag.value.startsWith(`cosmos`)) {
        addresses.push(tag.value)
      }
      return addresses
    }, [])
    return involvedAddresses
  }

  checkAddress(address) {
    if (!address.startsWith(this.delegatorBech32Prefix)) {
      throw new UserInputError(
        `The address you entered doesn't belong to the ${this.networkTitle} network`
      )
    }
  }

  async getTransactionsByHeight(height) {
    const txs = await this.loadPaginatedTxs(`txs?tx.height=${height}`)
    return Array.isArray(txs)
      ? txs.map(transaction =>
          this.reducers.transactionReducer(transaction, this.reducers)
        )
      : []
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
        throw Error()
      }
      const response = await this.query(
        `slashing/validators/${validatorConsensusPubKey}/signing_info`,
        { cacheOptions: { ttl: 60 } }
      )
      return {
        address: pubkeyToAddress(
          validatorConsensusPubKey,
          this.validatorConsensusBech32Prefix
        ),
        ...response
      }
    } catch (e) {
      return {
        address: pubkeyToAddress(
          validatorConsensusPubKey,
          this.validatorConsensusBech32Prefix
        ),
        missed_blocks_counter: '0',
        start_height: '0'
      }
    }
  }

  async getAllValidatorSets() {
    const response = await this.query(`validatorsets/latest`)
    return response
  }

  async getSelfStake(validator) {
    const hexDelegatorAddressFromOperator = decodeB32(validator.operatorAddress)
    const delegatorAddressFromOperator = encodeB32(
      hexDelegatorAddressFromOperator,
      this.delegatorBech32Prefix
    )

    let selfDelegation
    try {
      selfDelegation = await this.query(
        `staking/delegators/${delegatorAddressFromOperator}/delegations/${validator.operatorAddress}`
      )
    } catch (error) {
      // in some rare cases the validator has no self delegation so this query fails
      if (error.extensions.response.status === 500) {
        const parsedErrorLog = JSON.parse(error.extensions.response.body.error)
        if (parsedErrorLog.message.startsWith('no delegation for this')) {
          return 0
        }
      }

      // still throw in every other unknown case
      throw error
    }

    return this.reducers.delegationReducer(selfDelegation, validator).amount
  }

  async getAllValidators() {
    let [
      validators,
      annualProvision,
      validatorSet,
      signedBlocksWindow
    ] = await Promise.all([
      Promise.all([
        this.query(`staking/validators?status=unbonding`),
        this.query(`staking/validators?status=bonded`),
        this.query(`staking/validators?status=unbonded`)
      ]).then(validatorGroups => [].concat(...validatorGroups)),
      this.getAnnualProvision(),
      this.getAllValidatorSets(),
      this.getSignedBlockWindow()
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
      const consensusAddress = pubkeyToAddress(
        validator.consensus_pubkey,
        this.validatorConsensusBech32Prefix
      )
      validator.voting_power = consensusValidators[consensusAddress]
        ? BigNumber(consensusValidators[consensusAddress].voting_power)
            .div(totalVotingPower)
            .toNumber()
        : 0
      validator.signing_info = signingInfos[consensusAddress]
    })

    return validators.map(validator =>
      this.reducers.validatorReducer(
        this.networkId,
        signedBlocksWindow,
        validator,
        annualProvision
      )
    )
  }

  async getAllProposals() {
    const response = await this.query('gov/proposals')
    const { bonded_tokens: totalBondedTokens } = await this.query(
      '/staking/pool'
    )
    if (!Array.isArray(response)) return []
    const proposals = response.map(proposal => {
      return this.reducers.proposalReducer(
        this.networkId,
        proposal,
        {}, //TODO also add tally to overview when we need it
        totalBondedTokens
      )
    })
    return _.orderBy(proposals, 'id', 'desc')
  }

  async getProposalById({ proposalId }) {
    const proposal = await this.query(`gov/proposals/${proposalId}`).catch(
      () => {
        throw new UserInputError(
          `There is no proposal in the network with ID '${proposalId}'`
        )
      }
    )
    const [
      tally,
      proposer,
      { bonded_tokens: totalBondedTokens }
    ] = await Promise.all([
      this.query(`/gov/proposals/${proposalId}/tally`),
      this.query(`gov/proposals/${proposalId}/proposer`).catch(() => {
        return { proposer: `unknown` }
      }),
      this.query(`/staking/pool`)
    ])
    return this.reducers.proposalReducer(
      this.networkId,
      proposal,
      tally,
      proposer,
      totalBondedTokens
    )
  }

  async getGovernanceParameters() {
    const depositParameters = await this.query(`gov/parameters/deposit`)
    const tallyingParamers = await this.query(`gov/parameters/tallying`)

    return this.reducers.governanceParameterReducer(
      depositParameters,
      tallyingParamers
    )
  }

  async getDelegatorVote({ proposalId, address }) {
    this.checkAddress(address)
    const response = await this.query(`gov/proposals/${proposalId}/votes`)
    const votes = response || []
    const vote = votes.find(({ voter }) => voter === address) || {}
    return {
      option: vote.option
    }
  }

  async getBlockByHeight({ blockHeight }) {
    let block, transactions
    if (blockHeight) {
      const response = await Promise.all([
        this.get(`blocks/${blockHeight}`),
        this.getTransactionsByHeight(blockHeight)
      ])
      block = response[0]
      transactions = response[1]
    } else {
      block = await this.get(`blocks/latest`)
      transactions = await this.getTransactionsByHeight(
        block.block_meta.header.height
      )
    }
    return this.reducers.blockReducer(this.networkId, block, transactions)
  }

  async calculateFiatValues(balances, fiatCurrency) {
    return Promise.all(
      balances.map(balance => ({
        denom: this.reducers.coinReducer(balance).denom,
        fiatValue: this.calculateFiatValue
          ? this.calculateFiatValue(balance, fiatCurrency)
          : null
      }))
    )
  }

  async getBalancesFromAddress(address, fiatCurrency = `EUR`) {
    this.checkAddress(address)
    const response = await this.query(`bank/balances/${address}`)
    let balances = response || []
    const coins = balances.map(this.reducers.coinReducer)
    // We calculate the fiatValue field for networks with multiple tokens
    // For now, it is just e-Money
    const fiatBalances = await this.calculateFiatValues(balances, fiatCurrency)
    return coins.map(coin => {
      return this.reducers.balanceReducer(
        coin,
        fiatBalances.find(({ denom }) => denom === coin.denom).fiatValue
      )
    })
  }

  async getAccountInfo(address) {
    const response = await this.query(`auth/accounts/${address}`)
    const accountType = response.type
    const accountValue = response && response.value
    return this.reducers.accountInfoReducer(accountValue, accountType)
  }

  async getDelegationsForDelegatorAddress(address, validatorsDictionary) {
    this.checkAddress(address)
    let delegations =
      (await this.query(`staking/delegators/${address}/delegations`)) || []

    return delegations
      .filter(delegation =>
        BigNumber(
          this.reducers.calculateTokens(
            validatorsDictionary[delegation.validator_address],
            delegation.shares
          )
        ).isGreaterThanOrEqualTo(1e-6)
      )
      .map(delegation =>
        this.reducers.delegationReducer(
          delegation,
          validatorsDictionary[delegation.validator_address]
        )
      )
  }

  async getUndelegationsForDelegatorAddress(address, validatorsDictionary) {
    this.checkAddress(address)
    let undelegations =
      (await this.query(
        `staking/delegators/${address}/unbonding_delegations`
      )) || []

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
      this.reducers.undelegationReducer(
        undelegation,
        validatorsDictionary[undelegation.validator_address]
      )
    )
  }

  async getDelegationForValidator(delegatorAddress, validator) {
    this.checkAddress(delegatorAddress)
    const operatorAddress = validator.operatorAddress
    const delegation = await this.query(
      `staking/delegators/${delegatorAddress}/delegations/${operatorAddress}`
    ).catch(() => ({
      validator_address: operatorAddress,
      delegator_address: delegatorAddress,
      shares: 0
    }))
    return this.reducers.delegationReducer(delegation, validator)
  }

  async getAnnualProvision() {
    const response = await this.query(`minting/annual-provisions`)
    return response
  }

  async getExpectedReturns(validator) {
    const annualProvision = await this.getAnnualProvision()
    const expectedReturns = this.reducers.expectedRewardsPerToken(
      validator,
      validator.commission,
      annualProvision
    )
    return expectedReturns
  }

  async getRewards(delegatorAddress, validatorsDictionary, delegations = null) {
    this.checkAddress(delegatorAddress)
    if (!delegations) {
      delegations = await this.getDelegationsForDelegatorAddress(
        delegatorAddress,
        validatorsDictionary
      )
    }
    const rewards = await Promise.all(
      delegations.map(async ({ validatorAddress, validator }) => ({
        validator,
        rewards:
          (await this.query(
            `distribution/delegators/${delegatorAddress}/rewards/${validatorAddress}`
          )) || []
      }))
    )
    return rewards
      .filter(({ rewards }) => rewards.length > 0)
      .map(({ rewards, validator }) =>
        this.reducers.rewardReducer(rewards[0], validator)
      )
  }

  async getOverview(delegatorAddress, validatorsDictionary) {
    this.checkAddress(delegatorAddress)
    const [
      balances,
      delegations,
      undelegations,
      stakingDenom
    ] = await Promise.all([
      this.getBalancesFromAddress(delegatorAddress),
      this.getDelegationsForDelegatorAddress(
        delegatorAddress,
        validatorsDictionary
      ),
      this.getUndelegationsForDelegatorAddress(
        delegatorAddress,
        validatorsDictionary
      ),
      this.getStakinDenom()
    ])
    const rewards = await this.getRewards(
      delegatorAddress,
      validatorsDictionary,
      delegations
    )
    return this.reducers.overviewReducer(
      balances,
      delegations,
      undelegations,
      rewards,
      stakingDenom
    )
  }

  async loadPaginatedTxs(url, page = 1, totalAmount = 0) {
    const pagination = `&limit=1000000000&page=${page}`
    let allTxs = []

    const { txs, total_count } = await this.get(`${url}${pagination}`)
    allTxs = allTxs.concat(txs)

    // there is a bug in page_number in gaia-13007 so we can't use is
    if (allTxs.length + totalAmount < Number(total_count)) {
      return allTxs.concat(
        await this.loadPaginatedTxs(url, page + 1, totalAmount + allTxs.length)
      )
    }

    return allTxs
  }

  async getTransactions(address) {
    this.checkAddress(address)

    const txs = await Promise.all([
      this.loadPaginatedTxs(`/txs?sender=${address}`),
      this.loadPaginatedTxsget(`/txs?recipient=${address}`),
      this.loadPaginatedTxs(`/txs?action=submit_proposal&proposer=${address}`),
      this.loadPaginatedTxs(`/txs?action=deposit&depositor=${address}`),
      this.loadPaginatedTxs(`/txs?action=vote&voter=${address}`),
      this.loadPaginatedTxs(`/txs?action=delegate&delegator=${address}`),
      this.loadPaginatedTxs(
        `/txs?action=begin_redelegate&delegator=${address}`
      ),
      this.loadPaginatedTxs(`/txs?action=begin_unbonding&delegator=${address}`),
      this.loadPaginatedTxs(
        `/txs?action=withdraw_delegator_reward&delegator=${address}`
      ),
      this.loadPaginatedTxs(
        `/txs?action=withdraw_validator_rewards_all&source-validator=${address}`
      )
    ]).then(transactionGroups => [].concat(...transactionGroups))

    const duplicateFreeTxs = uniqWith(txs, (a, b) => a.txhash === b.txhash)
    const sortedTxs = sortBy(duplicateFreeTxs, ['timestamp'])
    const reversedTxs = reverse(sortedTxs)
    return reversedTxs.map(tx =>
      this.reducers.transactionReducer(tx, this.reducers)
    )
  }

  async awaitUp() {
    const start = new Date().getTime()
    // we need to wait until the stargate API is up and has the expected shema
    let up = false
    while (!up) {
      if (new Date().getTime() - start > 90000) {
        throw new Error('Timed out waiting for stargarte API to be up.')
      }
      try {
        // test if the stargate API has the expected schema by probing one setup table
        await this.get('/blocks/latest')
        up = true
      } catch (err) {
        console.log(err)
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Waiting for stargate API to be up')
      }
    }
  }
}

module.exports = CosmosV0API
