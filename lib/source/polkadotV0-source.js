const BigNumber = require('bignumber.js')
const { uniqWith, chunk } = require('lodash')
const delegationEnum = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' }

class polkadotAPI {
  constructor(network, store, db) {
    this.network = network
    this.stakingViewDenom = network.coinLookup[0].viewDenom
    this.setReducers()
    this.store = store
    this.db = db
  }

  setReducers() {
    this.reducers = require('../reducers/polkadotV0-reducers')
  }

  // rpc initialization is async so we always need to assume we need to wait for it to be initialized
  async getAPI() {
    const api = this.store.polkadotRPC
    await api.isReady
    return api
  }

  async getBlockHeight() {
    const api = await this.getAPI()
    const block = await api.rpc.chain.getBlock()
    return block.block.header.number.toNumber()
  }

  async getBlockByHeightV2(blockHeight) {
    const api = await this.getAPI()

    // heavy nesting to provide optimal parallelization here
    const [
      [{ author }, { block }, blockHash],
      sessionIndex
    ] = await Promise.all([
      api.rpc.chain.getBlockHash(blockHeight).then(async blockHash => {
        const [{ author }, { block }] = await Promise.all([
          api.derive.chain.getHeader(blockHash),
          api.rpc.chain.getBlock(blockHash)
        ])

        return [{ author }, { block }, blockHash]
      }),
      api.query.babe.epochIndex()
    ])

    const transactions = await this.getTransactionsV2(
      block.extrinsics,
      parseInt(blockHeight)
    )

    return this.reducers.blockReducer(
      this.network.id,
      blockHeight,
      blockHash,
      sessionIndex.toNumber(),
      author,
      transactions
    )
  }

  async getTransactionsV2(extrinsics, blockHeight) {
    return Array.isArray(extrinsics)
      ? this.reducers.transactionsReducerV2(
          this.network,
          extrinsics,
          blockHeight,
          this.reducers
        )
      : []
  }

  async getAllValidators() {
    const api = await this.getAPI()

    // Fetch all stash addresses for current session (including validators and intentions)
    const allStashAddresses = await api.derive.staking.stashes()

    // Fetch active validator addresses for current session.
    const validatorAddresses = await api.query.session.validators()

    // Fetch all validators staking info
    let allValidators = await Promise.all(
      allStashAddresses.map(authorityId =>
        api.derive.staking.account(authorityId)
      )
    )
    allValidators = JSON.parse(JSON.stringify(allValidators))

    // Calculate and update total active staked funds
    let networkTotalStake = new BigNumber(0)
    allValidators
      .filter(validator => validatorAddresses.includes(validator.accountId))
      .forEach(validator => {
        if (validator.exposure) {
          const accum = new BigNumber(validator.exposure.total)
          networkTotalStake = networkTotalStake.plus(accum)
        }
      })

    // Fetch identity info
    let allValidatorsIdentity = await Promise.all(
      allStashAddresses.map(authorityId =>
        api.derive.accounts.info(authorityId)
      )
    )
    allValidatorsIdentity = JSON.parse(JSON.stringify(allValidatorsIdentity))

    allValidators.forEach(validator => {
      if (validatorAddresses.includes(validator.accountId)) {
        validator.status = `ACTIVE`
      } else {
        validator.status = `INACTIVE`
      }
      const identity = allValidatorsIdentity.find(
        validatorIdentity => validatorIdentity.accountId === validator.accountId
      )
      validator.identity = JSON.parse(JSON.stringify(identity.identity))
      if (validator.exposure) {
        const validatorStake = new BigNumber(validator.exposure.total)
        validator.votingPower = validatorStake.div(networkTotalStake).toNumber()
        validator.tokens =
          validatorStake *
          this.network.coinLookup[0].chainToViewConversionFactor
        validator.nominations = JSON.parse(
          JSON.stringify(validator.exposure.others)
        ) // Added for faster delegations search
      } else {
        validator.votingPower = 0
      }
    })
    return allValidators.map(validator =>
      this.reducers.validatorReducer(this.network, validator)
    )
  }

  async getSelfStake(validator) {
    return validator.selfStake
  }

  async getBalancesFromAddress(address) {
    const api = await this.getAPI()
    const account = await api.query.system.account(address)
    const totalBalance = account.data.free
    const freeBalance = BigNumber(totalBalance.toString()).minus(
      account.data.miscFrozen.toString()
    )
    return this.reducers.balanceReducer(
      this.network,
      freeBalance.toString(),
      totalBalance.toString()
    )
  }

  async getExpectedReturns() {
    return null
  }

  async getLastRewardWithdraw(delegatorAddress) {
    const api = await this.getAPI()
    const stakingInfo = await api.derive.staking.query(delegatorAddress)
    if (!stakingInfo.stakingLedger) {
      return undefined
    }
    const lastEraReward = parseInt(stakingInfo.stakingLedger.lastReward) + 1
    return lastEraReward
  }

  async getRemoteRewards(delegatorAddress) {
    // This is currently super slow if the account have many pending payouts (same as in Polkadot JS UI)
    // Example execution times:
    // - 10-15s for an account with 1 pending payout
    // - Hangs API for an account with >= 20 eras pending payouts
    const api = await this.getAPI()
    const lastEraReward = await this.getLastRewardWithdraw(delegatorAddress)
    // in this case we assume the delegator has no rewards
    if (lastEraReward === undefined) {
      return []
    }
    const rewards = await api.derive.staking.stakerRewards(
      delegatorAddress,
      lastEraReward
    )
    return this.reducers.rewardsReducer(
      this.network,
      this.store.validators,
      rewards.map(reward => ({
        ...reward,
        address: delegatorAddress
      })),
      this.reducers
    )
  }

  async getRewards(delegatorAddress) {
    const lastEraReward = await this.getLastRewardWithdraw(delegatorAddress)
    // in this case we assume the delegator has no rewards
    if (lastEraReward === undefined) {
      return []
    }
    const schema_prefix = this.network.id.replace(/-/, '_')
    const table = 'rewards'
    // TODO would be cool to aggregate the rows in the db already, didn't find how to
    const query = `
        query {
          ${schema_prefix}_${table}(where:{address:{_eq: "${delegatorAddress}"} height:{ _gte: "${lastEraReward}" }}) {
            address
            validator
            amount
            denom
          }
        }
      `
    const { data } = await this.db.query(query)
    const dbRewards = data[`${schema_prefix}_${table}`] || [] // TODO: add a backup plan. If it is not in DB, run the actual function
    return this.reducers.dbRewardsReducer(this.store.validators, dbRewards)
  }

  getAllDelegators() {
    const validators = this.store.validators
    const delegators = []
    Object.values(validators).forEach(validator => {
      validator.nominations.forEach(nomination => {
        if (!delegators.find(address => address === nomination.who)) {
          delegators.push(nomination.who)
        }
      })
    })

    return delegators
  }

  // ATTENTION: era since to putting a low number will take a long time
  async getEraRewards(era) {
    const api = await this.getAPI()
    const delegators = this.getAllDelegators()

    console.log('getEraRewards for number of delegators:', delegators.length)

    // chunk the parallel queries to not kill the API
    const chunkedDelegators = chunk(delegators, 10)
    const rewards = await chunkedDelegators.reduce(
      async (allRewards, currentChunk) => {
        const timeId = 'stakerRewards_' + era + '_' + Math.random()
        console.time(timeId)
        const nestedRewardsForChunk = await Promise.all(
          currentChunk.map(async address => {
            const rewards = await api.derive.staking.stakerRewards(
              address,
              era - 1 // we want the rewards since the last era
            )
            await new Promise(resolve => setTimeout(resolve, 100))
            return rewards.map(reward => ({
              ...reward,
              address
            }))
          })
        )
        console.timeEnd(timeId)
        return (await allRewards).concat(...nestedRewardsForChunk)
      },
      []
    )

    return this.reducers.rewardsReducer(
      this.network,
      this.store.validators,
      rewards,
      this.reducers
    )
  }

  async getOverview(delegatorAddress) {
    const accountBalances = await this.getBalancesFromAddress(delegatorAddress)
    return {
      networkId: this.networkId,
      address: delegatorAddress,
      totalStake: accountBalances[0] ? accountBalances[0].total : 0,
      totalStakeFiatValue: '',
      liquidStake: accountBalances[0] ? accountBalances[0].amount : 0,
      accountInformation: undefined
    }
  }

  getAccountInfo() {
    return null
  }

  async getDelegationsForDelegatorAddress(delegatorAddress) {
    let activeDelegations = []
    // now we get nominations that are already active (from the validators)
    Object.values(this.store.validators).forEach(validator => {
      validator.nominations.forEach(nomination => {
        if (delegatorAddress === nomination.who) {
          activeDelegations.push(
            this.reducers.delegationReducer(
              this.network,
              nomination,
              validator,
              delegationEnum.ACTIVE
            )
          )
        }
      })
    })
    // in Polkadot nominations are inactive in the beginning until session change
    // so we also need to check the user's inactive delegations
    const inactiveDelegations = await this.getInactiveDelegationsForDelegatorAddress(
      delegatorAddress
    )
    const allDelegations = [...activeDelegations, ...inactiveDelegations]
    // filter empty validators
    const filteredDelegations = allDelegations.filter(
      delegation => delegation.validator
    )
    // remove duplicates
    return uniqWith(
      filteredDelegations,
      (a, b) => a.validator.operatorAddress === b.validator.operatorAddress
    )
  }

  async getInactiveDelegationsForDelegatorAddress(delegatorAddress) {
    const api = await this.getAPI()
    let inactiveDelegations = []

    const stakingInfo = await api.query.staking.nominators(delegatorAddress)
    const allDelegations =
      (stakingInfo && stakingInfo.raw && stakingInfo.raw.targets) || []
    allDelegations.forEach(nomination => {
      inactiveDelegations.push(
        this.reducers.delegationReducer(
          this.network,
          nomination,
          this.store.validators[nomination.toHuman()],
          delegationEnum.INACTIVE
        )
      )
    })
    return inactiveDelegations
  }

  // TODO: find out how to get all undelegations in Polkadot
  getUndelegationsForDelegatorAddress() {
    return []
  }

  getStakingViewDenom() {
    return this.stakingViewDenom
  }

  async getDelegationForValidator(delegatorAddress, validator) {
    // here we get nominations that are already active (from the validators)
    let delegation = validator.nominations.find(
      nomination => delegatorAddress === nomination.who
    )
    if (!delegation) {
      const api = await this.getAPI()
      // in Polkadot nominations are inactive in the beginning until session change
      // so we also need to check the user's inactive delegations
      const stakingInfo = await api.query.staking.nominators(delegatorAddress)
      const allDelegations =
        (stakingInfo && stakingInfo.raw && stakingInfo.raw.targets) || []
      const inactiveDelegation = allDelegations.find(
        nomination => validator.operatorAddress === nomination.toHuman()
      )
      if (inactiveDelegation) {
        return this.reducers.delegationReducer(
          this.network,
          inactiveDelegation,
          validator,
          delegationEnum.INACTIVE
        )
      }

      return {
        delegatorAddress,
        amount: 0,
        validator,
        active: delegationEnum.ACTIVE
      }
    }
    delegation = this.reducers.delegationReducer(
      this.network,
      delegation,
      validator,
      delegationEnum.ACTIVE
    )
    return (
      delegation || {
        delegatorAddress,
        amount: 0,
        validator,
        active: delegationEnum.ACTIVE
      }
    )
  }
}

module.exports = polkadotAPI
