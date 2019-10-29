const { cosmosMessageType } = require('../message-types')
const BigNumber = require('bignumber.js')
const _ = require('lodash')

function proposalBeginTime(proposal) {
  switch (proposal.proposal_status.toLowerCase()) {
    case 'depositperiod':
      return proposal.submit_time
    case 'votingperiod':
      return proposal.voting_start_time
    case 'passed':
    case 'rejected':
      return proposal.voting_end_time
  }
}

function proposalEndTime(proposal) {
  switch (proposal.proposal_status.toLowerCase()) {
    case 'depositperiod':
      return proposal.voting_start_time
    case 'votingperiod':
    // the end time lives in the past already if the proposal is finalized
    // eslint-disable-next-line no-fallthrough
    case 'passed':
    case 'rejected':
      return proposal.voting_end_time
  }
}

function atoms(nanoAtoms) {
  return BigNumber(nanoAtoms)
    .div(1000000)
    .toFixed(6)
}

const calculateTokens = (validator, shares) => {
  // this is the based on the idea that tokens should equal
  // (myShares / totalShares) * totalTokens where totalShares
  // and totalTokens are both represented as fractions
  const myShares = new BigNumber(shares || 0)
  const totalShares = new BigNumber(validator.delegatorShares)
  const totalTokens = new BigNumber(validator.tokens)

  if (totalShares.eq(0)) return new BigNumber(0)
  return myShares
    .times(totalTokens)
    .div(totalShares)
    .toFixed(6)
}

/* if you don't get this, write fabian@lunie.io */
// expected rewards if delegator stakes x tokens
const expectedRewardsPerToken = (validator, commission, annualProvision) => {
  if (validator.status === 0 || validator.jailed === true) {
    return 0
  }

  // share of all provisioned block rewards all delegators of this validator get
  const totalAnnualValidatorRewards = validator.voting_power * annualProvision
  // the validator takes a cut in amount of the commission
  const totalAnnualDelegatorRewards =
    totalAnnualValidatorRewards * (1 - commission)

  // validator.tokens is the amount of all tokens delegated to that validator
  // one token delegated would receive x percentage of all delegator rewards
  const delegatorSharePerToken = 1 / validator.tokens
  const annualDelegatorRewardsPerToken =
    totalAnnualDelegatorRewards * delegatorSharePerToken

  return annualDelegatorRewardsPerToken
}

// reduce deposits to one number and filter by required denom
function getDeposit(proposal, bondDenom) {
  return atoms(
    proposal.total_deposit.reduce(
      (sum, cur) => sum.plus(cur.denom === bondDenom ? cur.amount : 0),
      BigNumber(0)
    )
  )
}

function getTotalVotePercentage(proposal, totalBondedTokens, totalVoted) {
  // for passed proposals we can't calculate the total voted percentage, as we don't know the totalBondedTokens in the past
  if (['Passed', 'Rejected'].indexOf(proposal.proposal_status) !== -1) return -1
  if (totalVoted.eq(0)) return 0
  if (!totalBondedTokens) return -1
  return BigNumber(totalBondedTokens)
    .div(atoms(totalVoted))
    .toNumber()
}

function tallyReducer(proposal, totalBondedTokens) {
  const totalVoted = BigNumber(proposal.final_tally_result.yes)
    .plus(proposal.final_tally_result.no)
    .plus(proposal.final_tally_result.abstain)
    .plus(proposal.final_tally_result.no_with_veto)

  return {
    yes: atoms(proposal.final_tally_result.yes),
    no: atoms(proposal.final_tally_result.no),
    abstain: atoms(proposal.final_tally_result.abstain),
    veto: atoms(proposal.final_tally_result.no_with_veto),
    total: totalVoted,
    totalVotedPercentage: getTotalVotePercentage(
      proposal,
      totalBondedTokens,
      totalVoted
    )
  }
}

function proposalReducer(networkId, proposal, totalBondedTokens) {
  return {
    networkId,
    id: Number(proposal.proposal_id),
    type: proposal.proposal_content.type,
    title: proposal.proposal_content.value.title,
    description: proposal.proposal_content.value.description,
    creationTime: proposal.submit_time,
    status: proposal.proposal_status,
    statusBeginTime: proposalBeginTime(proposal),
    statusEndTime: proposalEndTime(proposal),
    tally: tallyReducer(proposal, totalBondedTokens),
    deposit: getDeposit(proposal, 'uatom') // TODO use denom lookup
  }
}

function governanceParameterReducer(depositParameters, tallyingParamers) {
  return {
    votingThreshold: tallyingParamers.threshold,
    vetoThreshold: tallyingParamers.veto,
    // for now assuming one deposit denom
    depositDenom: denomLookup(depositParameters.min_deposit[0].denom),
    depositThreshold: BigNumber(depositParameters.min_deposit[0].amount).div(
      1000000
    )
  }
}

function getValidatorStatus(validator) {
  if (validator.status === 2) {
    return {
      status: 'ACTIVE',
      status_detailed: 'active'
    }
  }
  if (
    validator.signing_info &&
    new Date(validator.signing_info.jailed_until) > new Date(9000, 1, 1)
  ) {
    return {
      status: 'INACTIVE',
      status_detailed: 'banned'
    }
  }

  return {
    status: 'INACTIVE',
    status_detailed: 'inactive'
  }
}

function validatorReducer(
  networkId,
  signedBlocksWindow,
  validator,
  annualProvision
) {
  const statusInfo = getValidatorStatus(validator)
  let websiteURL = validator.description.website
  if (!websiteURL || websiteURL === '[do-not-modify]') {
    websiteURL = ''
  } else if (!websiteURL.match(/http[s]?/)) {
    websiteURL = `https://` + websiteURL
  }

  return {
    networkId,
    operatorAddress: validator.operator_address,
    consensusPubkey: validator.consensus_pubkey,
    jailed: validator.jailed,
    details: validator.description.details,
    website: websiteURL,
    identity: validator.description.identity,
    name: validator.description.moniker,
    votingPower: validator.voting_power,
    startHeight: validator.signing_info
      ? validator.signing_info.start_height
      : undefined,
    uptimePercentage:
      1 -
      Number(validator.signing_info.missed_blocks_counter) /
        Number(signedBlocksWindow),
    tokens: atoms(validator.tokens),
    commissionUpdateTime: validator.commission.update_time,
    commission: validator.commission.rate,
    maxCommission: validator.commission.max_rate,
    maxChangeCommission: validator.commission.max_change_rate,
    status: statusInfo.status,
    statusDetailed: statusInfo.status_detailed,
    delegatorShares: validator.delegator_shares, // needed to calculate delegation token amounts from shares
    expectedReturns: expectedRewardsPerToken(
      validator,
      validator.commission.rate,
      annualProvision
    )
  }
}

function blockReducer(networkId, block, transactions) {
  return {
    networkId,
    height: block.block_meta.header.height,
    chainId: block.block_meta.header.chain_id,
    hash: block.block_meta.block_id.hash,
    time: block.block_meta.header.time,
    transactions,
    proposer_address: block.block_meta.header.proposer_address
  }
}

function denomLookup(denom) {
  if (denom === 'uatom') {
    return 'ATOM'
  }
  return denom.toUpperCase()
}

function coinReducer(coin) {
  if (!coin) {
    return {
      amount: 0,
      denom: ''
    }
  }

  // we want to show only atoms as this is what users know
  const denom = denomLookup(coin.denom)
  return {
    denom: denom,
    amount: BigNumber(coin.amount).div(1000000) // Danger: this might not be the case for all future tokens
  }
}

function delegationReducer(delegation, validator) {
  // in cosmos SDK v0 we need to convert shares (cosmos internal representation) to token balance
  const balance = calculateTokens(validator, delegation.shares)

  return {
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount: balance
  }
}

function undelegationReducer(undelegation, validator) {
  return {
    delegatorAddress: undelegation.delegator_address,
    validator,
    amount: atoms(undelegation.balance),
    startHeight: undelegation.creation_height,
    endTime: undelegation.completion_time
  }
}

function rewardReducer(reward, validator) {
  return {
    amount: atoms(reward.amount),
    validator
  }
}

function overviewReducer(balances, delegations, rewards, stakingDenom) {
  stakingDenom = denomLookup(stakingDenom)

  const totalRewards = _.flatten(rewards)
    .reduce((sum, { amount }) => BigNumber(sum).plus(amount), 0)
    .toFixed(6)
  const liquidStake = BigNumber(
    (
      balances.find(({ denom }) => denomLookup(denom) === stakingDenom) || {
        amount: 0
      }
    ).amount
  )
  const delegatedStake = delegations.reduce(
    (sum, { amount }) => BigNumber(sum).plus(amount),
    0
  )

  return {
    // rewards,
    totalRewards: totalRewards,
    liquidStake: liquidStake,
    totalStake: liquidStake.plus(delegatedStake)
  }
}

function getGroupByType(transactionType) {
  const transactionGroup = {
    [cosmosMessageType.SEND]: 'banking',
    [cosmosMessageType.CREATE_VALIDATOR]: 'staking',
    [cosmosMessageType.EDIT_VALIDATOR]: 'staking',
    [cosmosMessageType.DELEGATE]: 'staking',
    [cosmosMessageType.UNDELEGATE]: 'staking',
    [cosmosMessageType.BEGIN_REDELEGATE]: 'staking',
    [cosmosMessageType.UNJAIL]: 'staking',
    [cosmosMessageType.SUBMIT_PROPOSAL]: 'governance',
    [cosmosMessageType.DEPOSIT]: 'governance',
    [cosmosMessageType.VOTE]: 'governance',
    [cosmosMessageType.SET_WITHDRAW_ADDRESS]: 'distribution',
    [cosmosMessageType.WITHDRAW_DELEGATION_REWARD]: 'distribution',
    [cosmosMessageType.WITHDRAW_VALIDATOR_COMMISSION]: 'distribution',
    [cosmosMessageType.MULTI_SEND]: 'multisend'
  }

  return transactionGroup[transactionType] || 'unknown'
}

function transactionReducer(transaction) {
  let fee = coinReducer(false)
  if (Array.isArray(transaction.tx.value.fee.amount)) {
    fee = coinReducer(transaction.tx.value.fee.amount[0])
  } else {
    fee = coinReducer(transaction.tx.value.fee.amount)
  }

  const result = {
    type: transaction.tx.value.msg[0].type,
    group: getGroupByType(transaction.tx.value.msg[0].type),
    hash: transaction.txhash,
    height: Number(transaction.height),
    timestamp: transaction.timestamp,
    gasUsed: transaction.gas_used,
    gasWanted: transaction.gas_wanted,
    success: transaction.logs[0].success,
    log: transaction.logs[0].log,
    memo: transaction.tx.value.memo,
    fee,
    signature: transaction.tx.value.signatures[0].signature,
    value: JSON.stringify(transaction.tx.value.msg[0].value),
    raw: transaction
  }

  return result
}

module.exports = {
  proposalReducer,
  governanceParameterReducer,
  tallyReducer,
  validatorReducer,
  blockReducer,
  delegationReducer,
  coinReducer,
  transactionReducer,
  undelegationReducer,
  rewardReducer,
  overviewReducer,

  atoms,
  proposalBeginTime,
  proposalEndTime,
  getDeposit,
  getTotalVotePercentage,
  getValidatorStatus,
  expectedRewardsPerToken
}
