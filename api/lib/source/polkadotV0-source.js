const BigNumber = require('bignumber.js')
const BN = require('bn.js')
const { orderBy, uniqWith, keyBy } = require('lodash')
const { stringToU8a, hexToString, hexToU8a } = require('@polkadot/util')
const { encodeAddress } = require('@polkadot/util-crypto')
const Sentry = require('@sentry/node')
const {
  getPassingThreshold,
  getFailingThreshold
} = require('@polkassembly/util')
const {
  fixDecimalsAndRoundUpBigNumbers,
  toViewDenom
} = require('../../common/numbers.js')
const { BaseRESTDataSource } = require('./BaseRESTDataSource.js')
const delegationEnum = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' }

const CHAIN_TO_VIEW_COMMISSION_CONVERSION_FACTOR = 1e-9

class polkadotAPI extends BaseRESTDataSource {
  constructor(network, store, fiatValuesAPI, db) {
    super()
    this.baseURL = network.api_url
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

  async getNetworkAccountInfo(address) {
    if (typeof address === `object`) address = address.toHuman()
    if (this.store.identities[address]) return this.store.identities[address]
    // TODO: We are not handling sub-identities
    const accountInfo = !this.store.validators[address]
      ? await this.query(`pallets/identity/storage/identityOf?key1=${address}`)
      : undefined
    this.store.identities[address] = this.reducers.networkAccountReducer(
      address,
      accountInfo,
      this.store
    )
    return this.store.identities[address]
  }

  getBlockTime(block) {
    const setTimestamp = block.extrinsics.find(
      (extrinsic) =>
        extrinsic.method.pallet === 'timestamp' &&
        extrinsic.method.method === 'set'
    )
    return new Date(Number(setTimestamp.args.now)).toUTCString()
  }

  async getDateForBlockHeight(blockHeight) {
    const block = await this.query(`blocks/${blockHeight}`)
    return this.getBlockTime(block)
  }

  async getBlockHeight() {
    const latestBlock = await this.query(`blocks/head?finalized=false`)
    return latestBlock.number
  }

  async getBlockByHeightV2(blockHeight) {
    let block
    if (blockHeight) {
      block = await this.query(`blocks/${blockHeight}`)
    } else {
      block = await this.query(`blocks/head?finalized=false`)
    }
    const currentIndex = await this.query(
      `pallets/session/storage/currentIndex`
    )
    const sessionIndex = currentIndex.value
    const { value } = await this.query(
      `pallets/staking/storage/eraElectionStatus`
    )
    const data = {
      isInElection: value.Close === null ? false : true
    }

    const transactions = await this.getTransactionsV2(
      block.extrinsics,
      block.number
    )

    return this.reducers.blockReducer(
      this.network.id,
      this.network.chain_id,
      block.number,
      block.hash,
      sessionIndex,
      block.authorId,
      transactions,
      data
    )
  }

  async getBlockV2(blockHeight) {
    if (this.store.height === blockHeight) {
      return this.store.block
    } else {
      return this.getBlockByHeightV2(blockHeight)
    }
  }

  async getActiveEra() {
    const activeEra = await this.query(`pallets/staking/storage/activeEra`)
    return activeEra.value.index
  }

  async getTransactionsV2(extrinsics, blockHeight) {
    const api = await this.getAPI()
    return Array.isArray(extrinsics)
      ? await this.reducers.transactionsReducerV2(
          this.network,
          extrinsics,
          blockHeight,
          this.db,
          api
        )
      : []
  }

  async getValidators(blockHeight, fiatCurrency = 'USD') {
    const api = await this.getAPI()

    const [allStashAddresses, validatorAddresses] = await Promise.all([
      api.derive.staking.stashes(),
      this.query(`pallets/session/storage/validators`).then(
        (result) => result.value
      )
    ])

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
      allStashAddresses.map(
        async (authorityId) => await api.derive.accounts.info(authorityId)
      )
    )
    allValidatorsIdentity = JSON.parse(JSON.stringify(allValidatorsIdentity))

    // Get annualized validator rewards
    const expectedReturns = await this.getValidatorsExpectedReturns()

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
      const validatorIdentity = allValidatorsIdentity.find(
        (validatorIdentity) =>
          validatorIdentity.accountId === validator.accountId
      )
      validator.identity = JSON.parse(
        JSON.stringify(validatorIdentity.identity)
      )
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
    return Promise.all(
      allValidators.map(async (validator) => {
        const fiatValuesResponse = await this.fiatValuesAPI.calculateFiatValues(
          [
            {
              amount: validator.tokens,
              denom: this.network.stakingDenom
            }
          ],
          fiatCurrency
        )
        return this.reducers.validatorReducer(
          this.network,
          validator,
          fiatValuesResponse[this.network.stakingDenom]
        )
      })
    )
  }

  async getSelfStake(validator) {
    return validator.selfStake
  }

  async getBalancesFromAddress(address, fiatCurrency) {
    const balanceInfo = await this.query(`accounts/${address}/balance-info`)
    const { free, reserved, feeFrozen } = balanceInfo
    const totalBalance = BigNumber(free).plus(BigNumber(reserved))
    const freeBalance = BigNumber(free).minus(feeFrozen)
    const fiatValueAPI = this.fiatValuesAPI
    return this.reducers.balanceReducer(
      this.network,
      freeBalance,
      totalBalance,
      fiatValueAPI,
      fiatCurrency
    )
  }

  async getBalancesV2FromAddress(address, fiatCurrency) {
    // -> Free balance is NOT transferable balance
    // -> Total balance is equal to reserved plus free balance
    // -> Locks (due to staking o voting) are set over free balance, they overlap rather than add
    // -> Reserved balance (due to identity set) can not be used for anything
    // See https://wiki.polkadot.network/docs/en/build-protocol-info#free-vs-reserved-vs-locked-vs-vesting-balance
    const balanceInfo = await this.query(`accounts/${address}/balance-info`)

    // we need addressRole, as /accounts/:address/staking-info
    // query throws an error if address is not a stash
    const addressRole = await this.getAddressRole(address)
    let stakedBalance
    if (addressRole === `stash` || addressRole === `stash/controller`) {
      const stakingInfo = await this.query(`accounts/${address}/staking-info`)
      stakedBalance = stakingInfo.staking.active
    } else {
      stakedBalance = 0
    }

    const { free, reserved, feeFrozen } = balanceInfo
    const totalBalance = BigNumber(free).plus(BigNumber(reserved))
    const freeBalance = BigNumber(free).minus(feeFrozen)
    const fiatValueAPI = this.fiatValuesAPI
    return [
      await this.reducers.balanceV2Reducer(
        this.network,
        freeBalance,
        totalBalance,
        stakedBalance,
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
  async getValidatorsExpectedReturns() {
    let expectedReturns = []
    let validatorEraPoints = []
    let endEraValidatorList = []

    // We want the rewards for the last rewarded era (active - 1)
    const lastEra = (await this.getActiveEra()) - 1

    // Get last era reward
    const erasValidatorReward = await this.query(
      `pallets/staking/storage/erasValidatorReward?key1=${lastEra}`
    )
    const eraRewards = erasValidatorReward.value

    // Get last era reward points
    const erasRewardPoints = await this.query(
      `pallets/staking/storage/erasRewardPoints?key1=${lastEra}`
    )
    const individualEraPoints = erasRewardPoints.value.individual
    const totalEraPoints = erasRewardPoints.value.total
    Object.keys(individualEraPoints).forEach((accountId) => {
      validatorEraPoints.push({
        accountId,
        points: individualEraPoints[accountId]
      })
      endEraValidatorList.push(accountId)
    })

    // Get exposures for the last era
    const eraExposures = await Promise.all(
      endEraValidatorList.map((accountId) =>
        this.query(
          `pallets/staking/storage/erasStakers?key1=${lastEra}&key2=${accountId}`
        ).then(({ value }) => {
          return { accountId, exposure: value }
        })
      )
    )

    // Get validator commission for the last era (same order as endEraValidatorList)
    const eraValidatorCommission = await Promise.all(
      endEraValidatorList.map((accountId) =>
        this.query(
          `pallets/staking/storage/erasValidatorPrefs?key1=${lastEra}&key2=${accountId}`
        ).then((preferences) => preferences.value)
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
        ? endEraValidatorWithPoints.points
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

      // Estimated earnings per era for 1 token
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

  async loadLastClaimedErasForValidators(allValidators) {
    const lastClaimedEras = []
    for (let i = 0; i < allValidators.length; i++) {
      const stashId = allValidators[i]
      const { staking } = await this.query(`accounts/${stashId}/staking-info`)
      const claimedEras = staking.claimedRewards.map((era) => parseInt(era))
      lastClaimedEras[stashId] = Math.max(...claimedEras)
    }
    return lastClaimedEras
  }

  async filterRewards(rewards) {
    if (rewards.length === 0) {
      return []
    }
    const allValidators = rewards.map(({ validator }) => validator)
    const lastClaimedEras = await this.loadLastClaimedErasForValidators(
      allValidators
    )

    const filteredRewards = rewards.filter(
      ({ height, validator }) => height > lastClaimedEras[validator]
    )
    return filteredRewards
  }

  async getRewards(delegatorAddress, fiatCurrency, withHeight) {
    if (this.network.network_type !== 'polkadot' && withHeight) {
      throw new Error(
        'Rewards are only queryable per height in Polkadot networks'
      )
    }
    const dbRewards = (await this.db.getRewards(delegatorAddress)) || []
    const filteredRewards = await this.filterRewards(dbRewards)

    const rewards = this.reducers.dbRewardsReducer(
      this.store.validators,
      filteredRewards,
      withHeight
    )

    return rewards
  }

  // returns all active delegators
  async getAllDelegators() {
    const api = await this.getAPI()
    const delegators = await api.query.staking.nominators.entries()
    return delegators.map(([address]) => address.toHuman()[0])
  }

  getAccountInfo(address) {
    return {
      address,
      sequence: null,
      accountNumber: null
    }
  }

  async getAddressRole(address) {
    const bonded = await this.query(
      `pallets/staking/storage/bonded?key1=${address}`
    )
    if (bonded.value && bonded.value === address) {
      return `stash/controller`
    } else if (bonded.value && bonded.value !== address) {
      return `stash`
    } else {
      const ledger = await this.query(
        `pallets/staking/storage/ledger?key1=${address}`
      )
      if (ledger.value) {
        return `controller`
      } else {
        return `none`
      }
    }
  }

  async getStashAddress(address) {
    const ledger = await this.query(
      `pallets/staking/storage/ledger?key1=${address}`
    )
    return ledger.value ? ledger.value.stash : address
  }

  async getDelegationsForDelegatorAddress(delegatorAddress) {
    try {
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
    } catch (error) {
      Sentry.captureException(error)
      console.error(error)
      return []
    }
  }

  async getInactiveDelegationsForDelegatorAddress(delegatorAddress) {
    let inactiveDelegations = []

    // We always use stash address to query delegations
    delegatorAddress = await this.getStashAddress(delegatorAddress)

    const stakingInfo = await this.query(
      `pallets/staking/storage/nominators?key1=${delegatorAddress}`
    )
    const allDelegations = stakingInfo.value ? stakingInfo.value.targets : []
    allDelegations
      .filter((nomination) => !!this.store.validators[nomination])
      .forEach((nomination) => {
        inactiveDelegations.push(
          this.reducers.delegationReducer(
            this.network,
            { who: delegatorAddress, value: 0 }, // we don't know the value for inactive delegations
            this.store.validators[nomination],
            delegationEnum.INACTIVE
          )
        )
      })
    return inactiveDelegations
  }

  async getUndelegationsForDelegatorAddress(address) {
    const stakingLedger = await this.query(
      `pallets/staking/storage/ledger?key1=${address}`
    )
    if (!stakingLedger.value) {
      return []
    }
    const stakingProgress = await this.query(`pallets/staking/progress`)
    const blockHeight = await this.getBlockHeight()
    const api = await this.getAPI() // only needed for constants
    const epochDuration = api.consts.babe.epochDuration
    const sessionsPerEra = api.consts.staking.sessionsPerEra
    const eraLength = epochDuration * sessionsPerEra
    const eraRemainingBlocks = BigNumber(
      stakingProgress.nextActiveEraEstimate
    ).minus(BigNumber(blockHeight))
    const allUndelegations = stakingLedger.value.unlocking || []

    const undelegationsWithEndTime = allUndelegations.map((undelegation) => {
      const remainingEras = undelegation.era - stakingProgress.activeEra
      const remainingBlocks = BigNumber(remainingEras)
        .minus(BigNumber(1))
        .times(eraLength)
        .plus(eraRemainingBlocks)
        .toNumber()
      const totalMilliseconds = Number(remainingBlocks) * 6 * 1000
      return {
        ...undelegation,
        endTime: new Date(
          new Date().getTime() + totalMilliseconds
        ).toUTCString()
      }
    })

    return undelegationsWithEndTime.map((undelegation) =>
      this.reducers.undelegationReducer(undelegation, address, this.network)
    )
  }

  async getDelegationForValidator(delegatorAddress, validator) {
    // We always use stash address to query delegations
    delegatorAddress = await this.getStashAddress(delegatorAddress)

    // here we get nominations that are already active (from the validators)
    let delegation = validator.nominations.find(
      (nomination) => delegatorAddress === nomination.who
    )
    if (!delegation) {
      // in Polkadot nominations are inactive in the beginning until session change
      // so we also need to check the user's inactive delegations
      const stakingInfo = await this.query(
        `pallets/staking/storage/nominators?key1=${delegatorAddress}`
      )
      const allDelegations =
        (stakingInfo.value && stakingInfo.value.targets) || []
      const inactiveDelegation = allDelegations.find(
        (nomination) => validator.operatorAddress === nomination
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
        id: validator.operatorAddress,
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

  async getDemocracyProposalMetadata(proposal) {
    let creationTime
    let proposer = { name: '', address: '' }
    let description = ``
    if (proposal.image) {
      proposer = await this.getNetworkAccountInfo(proposal.image.proposer)
      description = await this.getProposalParameterDescriptionString(proposal)

      // get creationTime
      creationTime = await this.getDateForBlockHeight(proposal.image.at)
    }

    return {
      ...proposal,
      description,
      proposer,
      creationTime
    }
  }

  async getTreasuryProposalMetadata(proposal) {
    const beneficiary = await this.getNetworkAccountInfo(
      proposal.proposal.beneficiary
    )
    const amount = Number(
      toViewDenom(this.network, proposal.proposal.value)
    ).toFixed(2)
    const description = `Beneficiary: ${
      beneficiary.name ? beneficiary.name + ' - ' : ''
    } ${beneficiary.address}
    \nAmount: ${amount} ${this.network.stakingDenom}
    `
    const proposer = await this.getNetworkAccountInfo(
      proposal.proposal.proposer
    )
    return {
      ...proposal,
      description,
      proposer,
      beneficiary: await this.getNetworkAccountInfo(
        proposal.proposal.beneficiary
      ),
      votes: proposal.council[0] ? proposal.council[0].votes : undefined
    }
  }

  async getDemocracyProposalDetailedVotes(proposal, links) {
    const api = await this.getAPI()

    // in democracy proposals there is the first opening deposit made by the proposer
    // afterwards every account that seconds the proposal must deposit the same amount from the initial deposit
    const depositsSum = toViewDenom(
      this.network,
      BigNumber(proposal.balance).times(proposal.seconds.length).toNumber()
    )
    const deposits = await Promise.all(
      proposal.seconds.map(async (secondAddress) => {
        const secondDepositer = await this.getNetworkAccountInfo(
          secondAddress.toHuman()
        )
        return {
          depositer: secondDepositer,
          amount: [
            {
              amount: toViewDenom(this.network, proposal.balance),
              denom: this.network.stakingDenom
            }
          ]
        }
      })
    )
    const percentageDepositsNeeded = BigNumber(depositsSum)
      .times(100)
      .div(toViewDenom(this.network, api.consts.democracy.minimumDeposit))
      .toNumber()
    return {
      deposits,
      depositsSum,
      votingPercentageYes: `100`,
      votingPercentagedNo: `0`,
      percentageDepositsNeeded,
      links,
      timeline: [{ title: `Created`, time: proposal.creationTime }],
      council: false
    }
  }

  async getReferendumThreshold(proposal) {
    const thresholdType = proposal.status.threshold
    const electorate = await this.query(
      `pallets/balances/storage/totalIssuance`
    ).then(({ value }) => value)
    const ayeVotesWithoutConviction = proposal.allAye.reduce(
      (ayeAggregator, aye) => {
        return (ayeAggregator += Number(aye.balance))
      },
      0
    )
    const nayVotesWithoutConviction = proposal.allNay.reduce(
      (nayAggregator, nay) => {
        return (nayAggregator += Number(nay.balance))
      },
      0
    )
    const ayeVotes = Number(proposal.status.tally.ayes)
    const nayVotes = Number(proposal.status.tally.nays)
    const votingThresholdYes = getPassingThreshold({
      nays: new BN(
        BigNumber(nayVotes)
          .times(this.network.coinLookup[0].chainToViewConversionFactor)
          .toNumber()
      ),
      naysWithoutConviction: new BN(
        BigNumber(nayVotesWithoutConviction)
          .times(this.network.coinLookup[0].chainToViewConversionFactor)
          .toNumber()
      ),
      totalIssuance: new BN(
        BigNumber(electorate)
          .times(this.network.coinLookup[0].chainToViewConversionFactor)
          .toNumber()
      ),
      threshold: thresholdType
    }).passingThreshold
    const votingThresholdNo = getFailingThreshold({
      ayes: new BN(
        BigNumber(ayeVotes)
          .times(this.network.coinLookup[0].chainToViewConversionFactor)
          .toNumber()
      ),
      ayesWithoutConviction: new BN(
        BigNumber(ayeVotesWithoutConviction)
          .times(this.network.coinLookup[0].chainToViewConversionFactor)
          .toNumber()
      ),
      totalIssuance: new BN(
        BigNumber(electorate)
          .times(this.network.coinLookup[0].chainToViewConversionFactor)
          .toNumber()
      ),
      threshold: thresholdType
    }).failingThreshold

    return {
      votingThresholdYes: votingThresholdYes
        ? votingThresholdYes.toString()
        : undefined,
      votingThresholdNo: votingThresholdNo
        ? votingThresholdNo.toString()
        : undefined
    }
  }

  async getReferendumProposalDetailedVotes(proposal, links) {
    let proposalDelayInDays
    let proposalEndTime
    let proposalVotingPeriodStarted
    // votes involve depositing & locking some amount for referendum proposals
    const allDeposits = proposal.allAye.concat(proposal.allNay)
    const depositsSum = allDeposits.reduce((balanceAggregator, deposit) => {
      return (balanceAggregator += Number(deposit.balance))
    }, 0)
    const deposits = await Promise.all(
      allDeposits.map(async (deposit) => {
        const depositer = await this.getNetworkAccountInfo(deposit.accountId)
        return this.reducers.depositReducer(deposit, depositer, this.network)
      })
    )
    const votes = await Promise.all(
      proposal.allAye
        .map(async (aye) => {
          const voter = await this.getNetworkAccountInfo(aye.accountId)
          return {
            id: voter.address,
            voter,
            option: `Yes`,
            amount: this.reducers.coinReducer(this.network, aye.balance)
          }
        })
        .concat(
          proposal.allNay.map(async (nay) => {
            const voter = await this.getNetworkAccountInfo(nay.accountId)
            return {
              id: voter.address,
              voter,
              option: `No`,
              amount: this.reducers.coinReducer(this.network, nay.balance)
            }
          })
        )
    )
    const votesSum = proposal.voteCount
    const threshold = await this.getReferendumThreshold(proposal)
    const totalVotingPower = BigNumber(proposal.status.tally.ayes).plus(
      proposal.status.tally.nays
    )
    if (proposal.image) {
      proposalDelayInDays = Math.floor(
        /* proposal delay is the time that takes for the proposal to open for the voting period.
          6s is the average block duration for both Kusama and Polkadot */
        (proposal.status.delay * 6) / (3600 * 24)
      )
      const proposalTimeSpanInNumberOfBlocks =
        proposal.status.end - proposal.image.at
      const proposalTimeSpanInDays = Math.floor(
        (proposalTimeSpanInNumberOfBlocks * 6) / (3600 * 24)
      )
      proposalEndTime = new Date(
        new Date(proposal.creationTime).getTime() +
          proposalTimeSpanInDays * 24 * 60 * 60 * 1000
      ).toUTCString()
      proposalVotingPeriodStarted = proposalDelayInDays
        ? new Date(
            new Date(proposal.creationTime).getTime() +
              proposalDelayInDays * 24 * 60 * 60 * 1000
          ).toUTCString()
        : undefined
    }
    return {
      deposits,
      depositsSum: toViewDenom(this.network, depositsSum),
      votes,
      votesSum,
      votingThresholdYes: threshold.votingThresholdYes,
      votingThresholdNo: threshold.votingThresholdNo,
      votingPercentageYes:
        totalVotingPower.toNumber() > 0
          ? BigNumber(proposal.status.tally.ayes)
              .times(100)
              .div(totalVotingPower)
              .toNumber()
              .toFixed(2)
          : 0,
      votingPercentagedNo:
        totalVotingPower.toNumber() > 0
          ? BigNumber(proposal.status.tally.nays)
              .times(100)
              .div(totalVotingPower)
              .toNumber()
              .toFixed(2)
          : 0,
      links,
      timeline: [
        // warning: sometimes status.end - status.delay doesn't return the creation block. Don't know why
        {
          title: `Created`,
          time: proposal.creationTime
        },
        {
          title: `Voting Period Starts`,
          time: proposalVotingPeriodStarted
        },
        {
          title: `Voting Period Ends`,
          time: proposalEndTime
        }
      ],
      council: false
    }
  }

  async getTreasuryProposalDetailedVotes(proposal, links) {
    let votes

    if (proposal.votes) {
      votes = await Promise.all(
        proposal.votes.ayes
          .map(async (aye) => {
            const voter = await this.getNetworkAccountInfo(aye)
            return {
              id: voter.address,
              voter,
              option: `Yes`
            }
          })
          .concat(
            proposal.votes.nays.map(async (nay) => {
              const voter = await this.getNetworkAccountInfo(nay)
              return {
                id: voter.address,
                voter,
                option: `No`
              }
            })
          )
      )
    }
    return {
      votes,
      votesSum: votes ? votes.length : undefined,
      votingThresholdYes: proposal.votes ? proposal.votes.threshold : undefined,
      votingPercentageYes: proposal.votes
        ? (proposal.votes.ayes.length * 100) / votes.length
        : undefined,
      votingPercentagedNo: proposal.votes
        ? (proposal.votes.nays.length * 100) / votes.length
        : undefined,
      links,
      timeline: [],
      council: true
    }
  }

  async getDetailedVotes(proposal, type) {
    const links = await this.db.getNetworkLinks(this.network.id)
    if (type === `democracy`) {
      return await this.getDemocracyProposalDetailedVotes(proposal, links)
    }
    if (type === `referendum`) {
      return await this.getReferendumProposalDetailedVotes(proposal, links)
    }
    if (type === `treasury`) {
      return await this.getTreasuryProposalDetailedVotes(proposal, links)
    }
    return {
      links
    }
  }

  async getProposalParameterDescriptionString(proposal) {
    const api = await this.getAPI()

    // democracy proposals in Polkadot contain a parameter which is what is going to be changed
    let parameterDescription = ''
    if (proposal.image) {
      const {
        meta: { documentation },
        method,
        section
      } = api.registry.findMetaCall(proposal.image.proposal.callIndex)
      parameterDescription += `Parameter: ${section}.${method}`
      if (documentation[0]) {
        parameterDescription += `\n\nDescription: ${documentation[0]}`
      }
      const imageProposal = JSON.parse(JSON.stringify(proposal.image.proposal))
      Object.keys(imageProposal.args).forEach((key) => {
        const value = imageProposal.args[key]
        const ethAddressRegexp = /^0x[a-fA-F0-9]{40}$/g
        const resolvedValue =
          typeof value === 'string' &&
          value.startsWith('0x') &&
          !ethAddressRegexp.test(value)
            ? hexToString(value)
            : typeof value === 'object' && value && value.callIndex
            ? this.getProposalArguments(value, api)
            : value
        parameterDescription += `\n\n${
          key[0].toUpperCase() + key.substr(1)
        }: ${resolvedValue}`
      })
    }
    return parameterDescription
  }

  getProposalArguments(proposalArguments, api) {
    const keys = Object.keys(proposalArguments)
    let formattedArguments = {}
    keys.forEach((key) => {
      const value = proposalArguments[key]
      if (key === `callIndex`) {
        const { method, section } = api.registry.findMetaCall(hexToU8a(value))
        formattedArguments[`function`] = method
        formattedArguments[`module`] = section
        formattedArguments[`index`] = value
      } else {
        formattedArguments[key] = value
      }
    })
    return JSON.stringify(formattedArguments)
  }

  async getAllProposals() {
    if (this.network.feature_proposals !== 'ENABLED') {
      return []
    }
    const api = await this.getAPI()
    const [
      blockHeight,
      totalIssuance,
      democracyProposals,
      democracyReferendums,
      treasuryProposals,
      councilMembers,
      electionInfo
    ] = await Promise.all([
      this.getBlockHeight(),
      this.query(`pallets/balances/storage/totalIssuance`).then(
        (result) => result.value
      ),
      api.derive.democracy.proposals(),
      api.derive.democracy.referendums(),
      api.derive.treasury.proposals(),
      this.query(`pallets/council/storage/members`).then(
        (result) => result.value
      ),
      api.derive.elections.info()
    ])
    const allProposals = await Promise.all(
      democracyProposals
        .map(async (proposal) => {
          const proposalWithMetadata = await this.getDemocracyProposalMetadata(
            proposal
          )
          return this.reducers.democracyProposalReducer(
            this.network,
            proposalWithMetadata,
            await this.getDetailedVotes(proposalWithMetadata, `democracy`)
          )
        })
        .concat(
          democracyReferendums.map(async (proposal) => {
            const proposalWithMetadata = await this.getDemocracyProposalMetadata(
              proposal
            )
            return this.reducers.democracyReferendumReducer(
              this.network,
              proposalWithMetadata,
              totalIssuance,
              blockHeight,
              await this.getDetailedVotes(proposalWithMetadata, `referendum`)
            )
          })
        )
        .concat(
          treasuryProposals.proposals.map(async (proposal) => {
            const proposalWithMetadata = await this.getTreasuryProposalMetadata(
              proposal
            )
            return this.reducers.treasuryProposalReducer(
              this.network,
              {
                ...proposalWithMetadata,
                index: proposal.id,
                deposit: proposal.proposal.bond
              },
              councilMembers,
              blockHeight,
              electionInfo,
              await this.getDetailedVotes(
                {
                  ...proposal,
                  // will get voted on by council, might not be up for voting by council yet
                  votes: proposal.council[0]
                    ? proposal.council[0].votes
                    : undefined
                },
                `treasury`
              )
            )
          })
        )
    )
    // remove null proposals from filtered treasury proposals
    return orderBy(
      allProposals.filter((proposal) => proposal),
      'id',
      'desc'
    )
  }

  async getProposalById(proposalId) {
    const proposals = await this.getAllProposals()
    return proposals.find((proposal) => proposal.id === proposalId)
  }

  getDelegatorVote() {}

  async getTotalActiveAccounts() {
    const api = await this.getAPI()
    const accountKeys = await api.query.system.account.keys()
    const accounts = accountKeys.map((key) => key.args[0].toHuman())
    return accounts.length || 0
  }

  async getTopVoters() {
    // in Substrate we simply return council members
    const members = await this.query(
      `pallets/electionsPhragmen/storage/members`
    ).then(({ value }) => value)

    return members.map(([member]) => member)
  }

  async getTreasurySize() {
    const TREASURY_ADDRESS = encodeAddress(
      stringToU8a('modlpy/trsry'.padEnd(32, '\0')),
      false,
      this.network.prefix
    )
    const { free, miscFrozen } = await this.query(
      `accounts/${TREASURY_ADDRESS}/balance-info`
    )
    const freeBalance = BigNumber(free.toString()).minus(miscFrozen.toString())
    return freeBalance.toString()
  }

  async getGovernanceOverview() {
    const api = await this.getAPI()

    const activeEra = await this.getActiveEra()
    const [
      erasTotalStake,
      totalIssuance,
      treasurySize,
      links,
      totalVoters,
      topVoters,
      electionInfo
    ] = await Promise.all([
      this.query(
        `pallets/staking/storage/erasTotalStake?key1=${activeEra}`
      ).then((result) => result.value),
      this.query(`pallets/balances/storage/totalIssuance`).then(
        (result) => result.value
      ),
      this.getTreasurySize(),
      this.db.getNetworkLinks(this.network.id),
      this.getTotalActiveAccounts(),
      this.getTopVoters(),
      api.derive.elections.info()
    ])
    return {
      totalStakedAssets: fixDecimalsAndRoundUpBigNumbers(
        erasTotalStake,
        2,
        this.network,
        this.network.stakingDenom
      ),
      totalVoters,
      treasurySize: fixDecimalsAndRoundUpBigNumbers(
        treasurySize,
        2,
        this.network,
        this.network.stakingDenom
      ),
      topVoters: await Promise.all(
        topVoters.map(async (topVoterAddress) => {
          const accountInfo = await this.getNetworkAccountInfo(topVoterAddress)
          return this.reducers.topVoterReducer(
            topVoterAddress,
            electionInfo,
            accountInfo,
            totalIssuance,
            this.store.validators,
            this.network
          )
        })
      ),
      links
    }
  }
}

module.exports = polkadotAPI
