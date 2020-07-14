const BigNumber = require('bignumber.js')
const { uniqWith } = require('lodash')
const delegationEnum = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' }

const CHAIN_TO_VIEW_COMMISSION_CONVERSION_FACTOR = 1e-9
const MIGRATION_HEIGHT = 718 // https://polkadot.js.org/api/substrate/storage.html#migrateera-option-eraindex

class polkadotAPI {
  constructor(network, store, fiatValuesAPI, db) {
    this.network = network
    this.networkId = network.id
    this.stakingViewDenom = network.coinLookup[0].viewDenom
    this.setReducers()
    this.store = store
    this.fiatValuesAPI = fiatValuesAPI
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
      [{ author }, { block }, blockEvents, blockHash],
      sessionIndex
    ] = await Promise.all([
      api.rpc.chain.getBlockHash(blockHeight).then(async (blockHash) => {
        const [{ author }, { block }, blockEvents] = await Promise.all([
          api.derive.chain.getHeader(blockHash),
          api.rpc.chain.getBlock(blockHash),
          api.query.system.events.at(blockHash)
        ])

        return [{ author }, { block }, blockEvents, blockHash]
      }),
      api.query.babe.epochIndex()
    ])

    const transactions = await this.getTransactionsV2(
      block.extrinsics,
      blockEvents,
      parseInt(blockHeight)
    )

    const eraElectionStatus = await api.query.staking.eraElectionStatus()
    const data = {
      isInElection: eraElectionStatus.toString() === `Close` ? false : true
    }

    return this.reducers.blockReducer(
      this.network.id,
      this.network.chain_id,
      blockHeight,
      blockHash,
      sessionIndex.toNumber(),
      author,
      transactions,
      data
    )
  }

  async getEra() {
    const response = await this.api.query.staking.activeEra()
    return response.toJSON().index
  }

  async getBlockV2(blockHeight) {
    if (this.store.height === blockHeight) {
      return this.store.block
    } else {
      return this.getBlockByHeightV2(blockHeight)
    }
  }

  async getTransactionsV2(extrinsics, blockEvents, blockHeight) {
    return Array.isArray(extrinsics)
      ? this.reducers.transactionsReducerV2(
          this.network,
          extrinsics,
          blockEvents,
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
      allStashAddresses.map((authorityId) =>
        api.derive.staking.account(authorityId)
      )
    )
    allValidators = JSON.parse(JSON.stringify(allValidators))

    // Calculate and update total active staked funds
    let networkTotalStake = new BigNumber(0)
    allValidators
      .filter((validator) => validatorAddresses.includes(validator.accountId))
      .forEach((validator) => {
        if (validator.exposure) {
          const accum = new BigNumber(validator.exposure.total)
          networkTotalStake = networkTotalStake.plus(accum)
        }
      })

    // Fetch identity info
    let allValidatorsIdentity = await Promise.all(
      allStashAddresses.map((authorityId) =>
        api.derive.accounts.info(authorityId)
      )
    )
    allValidatorsIdentity = JSON.parse(JSON.stringify(allValidatorsIdentity))

    // Get annualized validator rewards
    const expectedReturns = await this.getAllValidatorsExpectedReturns()

    allValidators.forEach((validator) => {
      if (expectedReturns[validator.accountId.toString()]) {
        validator.expectedReturns =
          expectedReturns[validator.accountId.toString()]
      } else {
        // we return `` instead of undefined to display validators with
        // unknown rewards in the last era at the bottom of the list
        validator.expectedReturns = ``
      }
      if (validatorAddresses.includes(validator.accountId)) {
        validator.status = `ACTIVE`
      } else {
        validator.status = `INACTIVE`
      }
      const identity = allValidatorsIdentity.find(
        (validatorIdentity) =>
          validatorIdentity.accountId === validator.accountId
      )
      validator.identity = JSON.parse(JSON.stringify(identity.identity))
      if (validator.exposure) {
        const validatorStake = new BigNumber(validator.exposure.total)
        validator.votingPower =
          validatorStake.div(networkTotalStake).toNumber() || 0
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

    return allValidators.map((validator) =>
      this.reducers.validatorReducer(this.network, validator)
    )
  }

  async getSelfStake(validator) {
    return validator.selfStake
  }

  async getBalancesFromAddress(address, fiatCurrency) {
    const api = await this.getAPI()
    const account = await api.query.system.account(address)
    const totalBalance = account.data.free
    const freeBalance = BigNumber(totalBalance.toString()).minus(
      account.data.miscFrozen.toString()
    )
    const fiatValueAPI = this.fiatValuesAPI
    return this.reducers.balanceReducer(
      this.network,
      freeBalance.toString(),
      totalBalance.toString(),
      fiatValueAPI,
      fiatCurrency
    )
  }

  async getBalancesV2FromAddress(address, fiatCurrency) {
    const api = await this.getAPI()
    const account = await api.query.system.account(address)
    const totalBalance = account.data.free
    const freeBalance = BigNumber(totalBalance.toString()).minus(
      account.data.miscFrozen.toString()
    )
    const fiatValueAPI = this.fiatValuesAPI
    return [
      this.reducers.balanceV2Reducer(
        this.network,
        freeBalance.toString(),
        totalBalance.toString(),
        fiatValueAPI,
        fiatCurrency
      )
    ]
  }

  async getExpectedReturns(validator) {
    return validator.expectedReturns
  }

  //
  // Annualized validator rewards
  //
  async getAllValidatorsExpectedReturns() {
    let expectedReturns = []
    let validatorEraPoints = []
    const api = await this.getAPI()

    // We want the rewards for the last rewarded era (active - 1)
    const activeEra = parseInt(
      JSON.parse(JSON.stringify(await api.query.staking.activeEra())).index
    )
    const lastEra = activeEra - 1

    // Get last era reward
    const eraRewards = await api.query.staking.erasValidatorReward(lastEra)

    // Get last era reward points
    const eraPoints = await api.query.staking.erasRewardPoints(lastEra)
    eraPoints.individual.forEach((val, index) => {
      validatorEraPoints.push({ accountId: index.toHuman(), points: val })
    })
    const totalEraPoints = eraPoints.total.toNumber()

    // Get exposures for the last era
    const erasStakers = await api.query.staking.erasStakers.entries(lastEra)
    const eraExposures = erasStakers.map(([key, exposure]) => {
      return {
        accountId: key.args[1].toHuman(),
        exposure: JSON.parse(JSON.stringify(exposure))
      }
    })

    // Get validator addresses for the last era
    const endEraValidatorList = eraExposures.map((exposure) => {
      return exposure.accountId
    })

    // Get validator commission for the last era (same order as endEraValidatorList)
    const eraValidatorCommission = await Promise.all(
      endEraValidatorList.map((accountId) =>
        api.query.staking.erasValidatorPrefs(lastEra, accountId)
      )
    )

    endEraValidatorList.forEach((validator, index) => {
      const exposure = eraExposures.find(
        (exposure) => exposure.accountId === validator
      ).exposure
      const endEraValidatorWithPoints = validatorEraPoints.find(
        (item) => item.accountId === validator
      )
      const eraPoints = endEraValidatorWithPoints
        ? endEraValidatorWithPoints.points.toNumber()
        : 0
      const eraPointsPercent = eraPoints / totalEraPoints
      const poolRewardWithCommission = new BigNumber(eraRewards).multipliedBy(
        eraPointsPercent
      )
      const commissionAmount = poolRewardWithCommission.multipliedBy(
        eraValidatorCommission[index].commission *
          CHAIN_TO_VIEW_COMMISSION_CONVERSION_FACTOR
      )
      const poolRewardWithoutCommission = poolRewardWithCommission.minus(
        commissionAmount
      )

      // Estimated earnings per era for 1 KSM
      const stakeAmount = new BigNumber(1).dividedBy(
        this.network.coinLookup[0].chainToViewConversionFactor
      )
      const userStakeFraction = stakeAmount.dividedBy(
        new BigNumber(exposure.total).plus(stakeAmount)
      )
      const estimatedPayout = userStakeFraction.multipliedBy(
        poolRewardWithoutCommission
      )
      const annualizedValidatorReward = estimatedPayout
        .multipliedBy(this.network.coinLookup[0].chainToViewConversionFactor)
        .multipliedBy(this.network.erasPerDay)
        .multipliedBy(365)
        .toFixed(6)
      expectedReturns[validator] = annualizedValidatorReward
    })
    return expectedReturns
  }

  async loadClaimedRewardsForValidators(allValidators) {
    const api = await this.getAPI()

    const allStakingLedgers = {}

    for (let i = 0; i < allValidators.length; i++) {
      const stashId = allValidators[i]
      const result = await api.derive.staking.account(stashId)
      allStakingLedgers[stashId] = result.stakingLedger.claimedRewards
    }

    return allStakingLedgers
  }

  async filterRewards(rewards, delegatorAddress) {
    const api = await this.getAPI()
    if (rewards.length === 0) {
      return []
    }
    const allValidators = rewards.map(({ validator }) => validator)
    // DEPRECATE at era 718 + 84
    const userClaimedRewards = (
      await api.derive.staking.account(delegatorAddress)
    ).stakingLedger.claimedRewards
    const stakingLedgers = await this.loadClaimedRewardsForValidators(
      allValidators
    )

    const filteredRewards = rewards.filter(({ height: era, validator }) => {
      if (Number(era) <= MIGRATION_HEIGHT) {
        return !userClaimedRewards.includes(Number(era))
      }
      return (
        !stakingLedgers[validator] ||
        !stakingLedgers[validator].includes(Number(era))
      )
    })

    return filteredRewards
  }

  async getRewards(delegatorAddress) {
    const schema_prefix = this.network.id.replace(/-/, '_')
    const table = 'rewards'
    // TODO would be cool to aggregate the rows in the db already, didn't find how to
    const query = `
        query {
          ${schema_prefix}_${table}(where:{address:{_eq: "${delegatorAddress}"}}) {
            address
            validator
            amount
            denom
            height
          }
        }
      `
    const { data } = await this.db.query(query)
    const dbRewards = data[`${schema_prefix}_${table}`] || [] // TODO: add a backup plan. If it is not in DB, run the actual function

    const filteredRewards = await this.filterRewards(
      dbRewards,
      delegatorAddress
    )

    const rewards = this.reducers.dbRewardsReducer(
      this.store.validators,
      filteredRewards
    )

    return rewards
  }

  // returns all active delegators
  async getAllDelegators() {
    const api = await this.getAPI()
    const delegators = await api.query.staking.nominators.entries()
    return delegators.map(([address]) => address.toHuman()[0])
  }

  async getOverview(delegatorAddress, validatorsDictionary, fiatCurrency) {
    const accountBalances = await this.getBalancesFromAddress(
      delegatorAddress,
      fiatCurrency
    )
    const totalStake = accountBalances[0] ? accountBalances[0].total : 0
    const lunieCoin = {
      denom: this.network.coinLookup[0].viewDenom,
      amount: totalStake
    }
    const fiatValues = await this.fiatValuesAPI.calculateFiatValues(
      [lunieCoin],
      fiatCurrency
    )
    return {
      networkId: this.networkId,
      address: delegatorAddress,
      totalStake,
      totalStakeFiatValue: fiatValues[lunieCoin.denom],
      liquidStake: accountBalances[0] ? accountBalances[0].amount : 0,
      accountInformation: undefined
    }
  }

  getAccountInfo(address) {
    return {
      address,
      sequence: null,
      accountNumber: null
    }
  }

  async getAddressRole(address) {
    const api = await this.getAPI()
    const bonded = await api.query.staking.bonded(address)
    if (bonded.toString() && bonded.toString() === address) {
      return `stash/controller`
    } else if (bonded.toString() && bonded.toString() !== address) {
      return `stash`
    } else {
      const stakingLedger = await api.query.staking.ledger(address)
      if (stakingLedger.toString()) {
        return `controller`
      } else {
        return `none`
      }
    }
  }

  async getStashAddress(address) {
    const api = await this.getAPI()
    const stakingLedger = await api.query.staking.ledger(address)
    return stakingLedger.toString() ? stakingLedger.toJSON().stash : address
  }

  async getDelegationsForDelegatorAddress(delegatorAddress) {
    let activeDelegations = []

    // We always use stash address to query delegations
    delegatorAddress = await this.getStashAddress(delegatorAddress)

    // now we get nominations that are already active (from the validators)
    Object.values(this.store.validators).forEach((validator) => {
      validator.nominations.forEach((nomination) => {
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
      (delegation) => delegation.validator
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

    // We always use stash address to query delegations
    delegatorAddress = await this.getStashAddress(delegatorAddress)

    const stakingInfo = await api.query.staking.nominators(delegatorAddress)
    const allDelegations =
      stakingInfo && stakingInfo.toJSON() ? stakingInfo.toJSON().targets : []
    allDelegations.forEach((nomination) => {
      inactiveDelegations.push(
        this.reducers.delegationReducer(
          this.network,
          { who: nomination, value: 0 }, // we don't know the value for inactive delegations
          this.store.validators[nomination],
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
    // We always use stash address to query delegations
    delegatorAddress = await this.getStashAddress(delegatorAddress)

    // here we get nominations that are already active (from the validators)
    let delegation = validator.nominations.find(
      (nomination) => delegatorAddress === nomination.who
    )
    if (!delegation) {
      const api = await this.getAPI()
      // in Polkadot nominations are inactive in the beginning until session change
      // so we also need to check the user's inactive delegations
      const stakingInfo = await api.query.staking.nominators(delegatorAddress)
      const allDelegations =
        (stakingInfo && stakingInfo.raw && stakingInfo.raw.targets) || []
      const inactiveDelegation = allDelegations.find(
        (nomination) => validator.operatorAddress === nomination.toHuman()
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
