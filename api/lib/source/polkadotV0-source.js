const BigNumber = require('bignumber.js')
const BN = require('bn.js')
const { orderBy, uniqWith } = require('lodash')
const { stringToU8a, hexToString } = require('@polkadot/util')
const Sentry = require('@sentry/node')
const {
  getPassingThreshold,
  getFailingThreshold
} = require('@polkassembly/util')
const { fixDecimalsAndRoundUpBigNumbers } = require('../../common/numbers.js')
const delegationEnum = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' }
const { toViewDenom } = require('../../common/numbers')

const CHAIN_TO_VIEW_COMMISSION_CONVERSION_FACTOR = 1e-9

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

  async getNetworkAccountInfo(address, api) {
    if (typeof address === `object`) address = address.toHuman()
    if (this.store.identities[address]) return this.store.identities[address]
    const accountInfo = !this.store.validators[address]
      ? await api.derive.accounts.info(address)
      : undefined
    this.store.identities[address] = this.reducers.networkAccountReducer(
      address,
      accountInfo,
      this.store
    )
    return this.store.identities[address]
  }

  getBlockTime(block) {
    const args = block.block.extrinsics.map((extrinsic) =>
      extrinsic.method.args.find((arg) => arg)
    )
    const blockTimestamp = args[0]
    return new Date(Number(blockTimestamp)).toUTCString()
  }

  async getDateForBlockHeight(blockHeight) {
    const api = await this.getAPI()

    const blockHash = await api.rpc.chain.getBlockHash(blockHeight)
    const block = await api.rpc.chain.getBlock(blockHash)
    return this.getBlockTime(block)
  }

  async getBlockHeight() {
    const api = await this.getAPI()
    const block = await api.rpc.chain.getBlock()
    return block.block.header.number.toNumber()
  }

  async getBlockByHeightV2(blockHeight) {
    const api = await this.getAPI()

    let blockHash
    if (blockHeight) {
      blockHash = await api.rpc.chain.getBlockHash(blockHeight)
    } else {
      blockHash = await api.rpc.chain.getFinalizedHead()
    }
    // heavy nesting to provide optimal parallelization here
    const [
      { author, number },
      { block },
      blockEvents,
      sessionIndex
    ] = await Promise.all([
      api.derive.chain.getHeader(blockHash),
      api.rpc.chain.getBlock(blockHash),
      api.query.system.events.at(blockHash),
      api.query.babe.epochIndex()
    ])

    // in the case the height was not set
    blockHeight = number.toJSON()

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
      allStashAddresses.map(
        async (authorityId) => await api.derive.accounts.info(authorityId)
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
    const { free, reserved, feeFrozen } = account.data.toJSON()
    const totalBalance = BigNumber(free).plus(BigNumber(reserved))
    const freeBalance = BigNumber(free).minus(feeFrozen)
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
    const [account, stakingLedger] = await Promise.all([
      api.query.system.account(address),
      api.query.staking.ledger(address)
    ])
    // -> Free balance is NOT transferable balance
    // -> Total balance is equal to reserved plus free balance
    // -> Locks (due to staking o voting) are set over free balance, they overlap rather than add
    // -> Reserved balance (due to identity set) can not be used for anything
    // See https://wiki.polkadot.network/docs/en/build-protocol-info#free-vs-reserved-vs-locked-vs-vesting-balance
    const { free, reserved, feeFrozen } = account.data.toJSON()
    const totalBalance = BigNumber(free).plus(BigNumber(reserved))
    const freeBalance = BigNumber(free).minus(feeFrozen)
    const stakedBalance = stakingLedger.toJSON()
      ? BigNumber(stakingLedger.toJSON().active)
      : 0
    const fiatValueAPI = this.fiatValuesAPI
    return [
      await this.reducers.balanceV2Reducer(
        this.network,
        freeBalance.toString(),
        totalBalance.toString(),
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

  async filterRewards(rewards) {
    if (rewards.length === 0) {
      return []
    }
    const allValidators = rewards.map(({ validator }) => validator)
    const stakingLedgers = await this.loadClaimedRewardsForValidators(
      allValidators
    )

    const filteredRewards = rewards.filter(({ height: era, validator }) => {
      return (
        !stakingLedgers[validator] ||
        !stakingLedgers[validator].includes(Number(era))
      )
    })

    return filteredRewards
  }

  async getRewards(delegatorAddress, fiatCurrency, withHeight) {
    if (this.network.network_type !== 'polkadot' && withHeight) {
      throw new Error(
        'Rewards are only queryable per height in Polkadot networks'
      )
    }
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
    const api = await this.getAPI()
    let inactiveDelegations = []

    // We always use stash address to query delegations
    delegatorAddress = await this.getStashAddress(delegatorAddress)

    const stakingInfo = await api.query.staking.nominators(delegatorAddress)
    const allDelegations =
      stakingInfo && stakingInfo.toJSON() ? stakingInfo.toJSON().targets : []
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
    const api = await this.getAPI()

    const [stakingLedger, progress] = await Promise.all([
      api.query.staking.ledger(address),
      api.derive.session.progress()
    ])
    if (!stakingLedger.toJSON()) {
      return []
    }
    const allUndelegations = stakingLedger.toJSON().unlocking

    const undelegationsWithEndTime = allUndelegations.map((undelegation) => {
      const remainingEras = undelegation.era - progress.activeEra
      const remainingBlocks = BigNumber(remainingEras)
        .minus(BigNumber(1))
        .times(progress.eraLength)
        .plus(progress.eraLength)
        .minus(progress.eraProgress)
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
    const api = await this.getAPI()

    let creationTime
    let proposer = { name: '', address: '' }
    let description = ``
    if (proposal.image) {
      proposer = await this.getNetworkAccountInfo(proposal.image.proposer, api)
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
    const api = await this.getAPI()

    const beneficiary = await this.getNetworkAccountInfo(
      proposal.proposal.beneficiary,
      api
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
      proposal.proposal.proposer,
      api
    )
    return {
      ...proposal,
      description,
      proposer,
      beneficiary: await this.getNetworkAccountInfo(
        proposal.proposal.beneficiary,
        api
      )
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
          secondAddress.toHuman(),
          api
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
    const api = await this.getAPI()

    const thresholdType = proposal.status.threshold
    const electorate = await api.query.balances.totalIssuance()
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
    const api = await this.getAPI()

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
        const depositer = await this.getNetworkAccountInfo(
          deposit.accountId,
          api
        )
        return this.reducers.depositReducer(deposit, depositer, this.network)
      })
    )
    const votes = await Promise.all(
      proposal.allAye
        .map(async (aye) => {
          const voter = await this.getNetworkAccountInfo(aye.accountId, api)
          return {
            id: voter.address,
            voter,
            option: `Yes`,
            amount: this.reducers.coinReducer(this.network, aye.balance)
          }
        })
        .concat(
          proposal.allNay.map(async (nay) => {
            const voter = await this.getNetworkAccountInfo(nay.accountId, api)
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
    const api = await this.getAPI()
    let votes

    if (proposal.votes) {
      votes = await Promise.all(
        proposal.votes.ayes
          .map(async (aye) => {
            const voter = await this.getNetworkAccountInfo(aye, api)
            return {
              id: voter.address,
              voter,
              option: `Yes`
            }
          })
          .concat(
            proposal.votes.nays.map(async (nay) => {
              const voter = await this.getNetworkAccountInfo(nay, api)
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
            : value
        parameterDescription += `\n\n${
          key[0].toUpperCase() + key.substr(1)
        }: ${resolvedValue}`
      })
    }
    return parameterDescription
  }

  async getAllProposals() {
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
      api.query.balances.totalIssuance(),
      api.derive.democracy.proposals(),
      api.derive.democracy.referendums(),
      api.derive.treasury.proposals(),
      api.query.council.members(),
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

  async getTopVoters(electionInfo) {
    // in Substrate we simply return council members
    const councilMembersInRelevanceOrder = electionInfo.members.map(
      (runnerUp) => runnerUp[0]
    )
    return councilMembersInRelevanceOrder
  }

  async getTreasurySize() {
    const api = await this.getAPI()

    const TREASURY_ADDRESS = stringToU8a('modlpy/trsry'.padEnd(32, '\0'))
    const treasuryAccount = await api.query.system.account(TREASURY_ADDRESS)
    const totalBalance = treasuryAccount.data.free
    const freeBalance = BigNumber(totalBalance.toString()).minus(
      treasuryAccount.data.miscFrozen.toString()
    )
    return freeBalance.toString()
  }

  async getGovernanceOverview() {
    const api = await this.getAPI()
    const activeEra = parseInt(
      JSON.parse(JSON.stringify(await api.query.staking.activeEra())).index
    )
    const electionInfo = await api.derive.elections.info()
    const [
      erasTotalStake,
      totalIssuance,
      treasurySize,
      links,
      totalVoters,
      topVoters
    ] = await Promise.all([
      api.query.staking.erasTotalStake(activeEra),
      api.query.balances.totalIssuance(),
      this.getTreasurySize(),
      this.db.getNetworkLinks(this.network.id),
      this.getTotalActiveAccounts(),
      this.getTopVoters(electionInfo)
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
          const accountInfo = await this.getNetworkAccountInfo(
            topVoterAddress,
            api
          )
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
