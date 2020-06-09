const { RESTDataSource, HTTPCache } = require('apollo-datasource-rest')
const { InMemoryLRUCache } = require('apollo-server-caching')
const BigNumber = require('bignumber.js')
const { orderBy, keyBy, uniqBy } = require('lodash')
const { encodeB32, decodeB32, pubkeyToAddress } = require('../tools')
const { UserInputError } = require('apollo-server')
const networks = require('../../data/networks')
const { getNetworkGasPrices } = require('../../data/network-fees')
const delegationEnum = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' }

class CosmosV0API extends RESTDataSource {
  constructor(network, store, fiatValuesAPI) {
    super()
    this.baseURL = network.api_url
    this.initialize({})
    this.network = network
    this.networkId = network.id
    this.delegatorBech32Prefix = network.address_prefix
    this.validatorConsensusBech32Prefix = `${network.address_prefix}valcons`
    this.gasPrices = getNetworkGasPrices(network.id)
    this.store = store
    this.fiatValuesAPI = fiatValuesAPI
    this.viewDenom = network.coinLookup[0].viewDenom

    this.setReducers()
  }

  initialize(config) {
    this.context = config.context
    // manually set cache to checking it
    this.cache = new InMemoryLRUCache()
    this.httpCache = new HTTPCache(this.cache, this.httpFetch)
  }

  setReducers() {
    this.reducers = require('../reducers/cosmosV0-reducers')
  }

  // hacky way to get error text
  async getError(url) {
    try {
      return await this.get(url)
    } catch (error) {
      return error.extensions.response.body.error
    }
  }

  async getRetry(url, intent = 0) {
    // check cache size, and flush it if it's bigger than something
    if ((await this.cache.getTotalSize()) > 100000) {
      await this.cache.flush()
    }
    // clearing memoizedResults
    this.memoizedResults.clear()
    try {
      return await this.get(url, null, { cacheOptions: { ttl: 1 } }) // normally setting cacheOptions should be enought, but...
    } catch (error) {
      // give up
      if (intent >= 3) {
        console.error(
          `Error for query ${url} in network ${this.networkId} (tried 3 times)`
        )
        throw error
      }

      // retry
      await new Promise((resolve) => setTimeout(() => resolve(), 1000))
      return this.getRetry(url, intent + 1)
    }
  }

  // querying data from the cosmos REST API
  // is overwritten in cosmos v2 to extract from a differnt result format
  // some endpoints /blocks and /txs have a different response format so they use this.get directly
  async query(url) {
    return this.getRetry(url)
  }

  getStakingViewDenom() {
    return this.viewDenom
  }

  async getSignedBlockWindow() {
    const slashingParams = await this.query('/slashing/parameters')
    return slashingParams.signed_blocks_window
  }

  checkAddress(address) {
    if (!address.startsWith(this.delegatorBech32Prefix)) {
      throw new UserInputError(
        `The address you entered doesn't belong to the ${this.network.title} network`
      )
    }
  }

  async getTransactionsV2ByHeight(height) {
    const txs = await this.loadPaginatedTxs(`txs?tx.height=${height}`)
    return Array.isArray(txs)
      ? this.reducers.transactionsReducerV2(
          this.networkId,
          txs,
          this.reducers,
          this.network.stakingDenom
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

  async getAllValidatorSets(height = 'latest') {
    const response = await this.query(`validatorsets/${height}`)
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

    return this.reducers.delegationReducer(
      selfDelegation,
      validator,
      delegationEnum.ACTIVE
    ).amount
  }

  async getAllValidators(height) {
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
      ]).then((validatorGroups) => [].concat(...validatorGroups)),
      this.getAnnualProvision(),
      this.getAllValidatorSets(height),
      this.getSignedBlockWindow()
    ])

    // create a dictionary to reduce array lookups
    const consensusValidators = keyBy(validatorSet.validators, 'address')
    const totalVotingPower = validatorSet.validators.reduce(
      (sum, { voting_power }) => sum.plus(voting_power),
      BigNumber(0)
    )

    // query for signing info
    const signingInfos = keyBy(
      await this.getValidatorSigningInfos(validators),
      'address'
    )

    validators.forEach((validator) => {
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

    return validators.map((validator) =>
      this.reducers.validatorReducer(
        this.network.id,
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
    const proposals = response.map((proposal) => {
      return this.reducers.proposalReducer(
        this.network.id,
        proposal,
        {}, //TODO also add tally to overview when we need it
        totalBondedTokens
      )
    })

    return orderBy(proposals, 'id', 'desc')
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
      this.network.id,
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

  async getBlockByHeightV2(blockHeight) {
    let block, transactions
    if (blockHeight) {
      const response = await Promise.all([
        this.getRetry(`blocks/${blockHeight}`),
        this.getTransactionsV2ByHeight(blockHeight)
      ])
      block = response[0]
      transactions = response[1]
    } else {
      block = await this.getRetry(`blocks/latest`)
      transactions = await this.getTransactionsV2ByHeight(
        block.block_meta.header.height
      )
    }
    return this.reducers.blockReducer(this.network.id, block, transactions)
  }

  async getBlockV2(blockHeight) {
    if (!blockHeight || this.store.height === blockHeight) {
      return this.store.block
    } else {
      return this.getBlockByHeightV2(blockHeight)
    }
  }

  async getBalancesFromAddress(address, fiatCurrency) {
    this.checkAddress(address)
    const response = await this.query(`bank/balances/${address}`)
    let balances = response || []
    const coins = balances.map(this.reducers.coinReducer)
    const fiatValues = await this.fiatValuesAPI.calculateFiatValues(
      coins,
      fiatCurrency
    )
    return await Promise.all(
      coins.map((coin) => {
        return this.reducers.balanceReducer(
          coin,
          this.gasPrices,
          fiatValues[coin.denom],
          fiatCurrency
        )
      })
    )
  }

  async getBalancesV2FromAddress(address, fiatCurrency) {
    this.checkAddress(address)
    const [balancesResponse, delegations] = await Promise.all([
      this.query(`bank/balances/${address}`),
      this.getDelegationsForDelegatorAddress(address)
    ])
    let balances = balancesResponse || []
    if (balances.length === 0) {
      return [
        {
          type: `STAKE`,
          total: 0,
          denom: this.network.stakingDenom,
          available: 0
        }
      ]
    }
    const coins = balances.map(this.reducers.coinReducer)
    const fiatValueAPI = this.fiatValuesAPI
    return coins.map((coin) => {
      return this.reducers.balanceV2Reducer(
        coin,
        this.network.stakingDenom,
        delegations,
        fiatValueAPI,
        fiatCurrency
      )
    })
  }

  getNetwork(networkId) {
    return networks.find(({ id }) => id === networkId)
  }

  async getAccountInfo(address, networkId) {
    const network = this.getNetwork(networkId)
    if (!address.startsWith(network.address_prefix)) {
      throw new UserInputError("This address doesn't exist in this network")
    }
    const response = await this.query(`auth/accounts/${address}`)
    const accountType = response.type
    const accountValue = response && response.value
    return this.reducers.accountInfoReducer(accountValue, accountType)
  }

  async getDelegationsForDelegatorAddress(address) {
    this.checkAddress(address)
    let delegations =
      (await this.query(`staking/delegators/${address}/delegations`)) || []

    return delegations
      .filter((delegation) =>
        BigNumber(delegation.balance).isGreaterThanOrEqualTo(1)
      )
      .map((delegation) =>
        this.reducers.delegationReducer(
          delegation,
          this.store.validators[delegation.validator_address],
          delegationEnum.ACTIVE
        )
      )
  }

  async getUndelegationsForDelegatorAddress(address) {
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
          undelegation.entries.map((entry) => ({
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
    return flattenedUndelegations.map((undelegation) =>
      this.reducers.undelegationReducer(
        undelegation,
        this.store.validators[undelegation.validator_address]
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
    return this.reducers.delegationReducer(
      delegation,
      validator,
      delegationEnum.ACTIVE
    )
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

  async getRewards(delegatorAddress) {
    this.checkAddress(delegatorAddress)
    const delegations = await this.getDelegationsForDelegatorAddress(
      delegatorAddress
    )
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

  async getAllDelegators() {
    const allDelegations = await Object.keys(this.store.validators).reduce(
      async (all, validator) => {
        const delegations = await this.query(
          `staking/validators/${validator}/delegations`
        )
        return (await all).concat(delegations)
      },
      []
    )
    return uniqBy(allDelegations, 'delegator_address').map(
      ({ delegator_address }) => delegator_address
    )
  }

  async getOverview(delegatorAddress, validatorsDictionary, fiatCurrency) {
    this.checkAddress(delegatorAddress)
    const [balances, delegations, undelegations] = await Promise.all([
      this.getBalancesFromAddress(delegatorAddress),
      this.getDelegationsForDelegatorAddress(delegatorAddress),
      this.getUndelegationsForDelegatorAddress(delegatorAddress)
    ])
    const fiatValueAPI = this.fiatValuesAPI
    return this.reducers.overviewReducer(
      balances,
      delegations,
      undelegations,
      this.network.stakingDenom,
      fiatValueAPI,
      fiatCurrency,
      this.reducers
    )
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
    ]).then((transactionGroups) => [].concat(...transactionGroups))
    return this.reducers.formatTransactionsReducer(txs, this.reducers)
  }

  async loadPaginatedTxs(url, page = 1, totalAmount = 0) {
    const pagination = `&limit=1000000000&page=${page}`
    let allTxs = []

    const { txs, total_count } = await this.getRetry(`${url}${pagination}`)
    allTxs = allTxs.concat(txs)

    // there is a bug in page_number in gaia-13007 so we can't use is
    if (allTxs.length + totalAmount < Number(total_count)) {
      return allTxs.concat(
        await this.loadPaginatedTxs(url, page + 1, totalAmount + allTxs.length)
      )
    }

    return allTxs
  }
}

module.exports = CosmosV0API
