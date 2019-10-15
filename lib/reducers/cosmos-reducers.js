const BigNumber = require('bignumber.js')
const { encodeB32, decodeB32 } = require('../tools')

const NETWORK_ID = 'cosmoshub'

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
    case 'passed':
    case 'rejected':
      return proposal.voting_end_time
  }
}

function atoms(nanoAtoms) {
  return BigNumber(nanoAtoms).div(1000000)
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

function getTotalVotedPercentage(proposal, totalBondedTokens, totalVoted) {
  // for passed proposals we can't calculate the total voted percentage, as we don't know the totalBondedTokens in the past
  if (['Passed', 'Rejected'].indexOf(proposal.proposal_status) !== -1) return -1
  if (totalVoted.eq(0)) return 0
  if (!totalBondedTokens) return -1
  return BigNumber(totalBondedTokens)
    .div(atoms(totalVoted))
    .toNumber()
}

function tallyReducer(proposal, totalBondedTokens) {
  const totalVoted = atoms(
    BigNumber(proposal.final_tally_result.yes)
      .plus(proposal.final_tally_result.no)
      .plus(proposal.final_tally_result.abstain)
      .plus(proposal.final_tally_result.no_with_veto)
  )

  return {
    yes: atoms(proposal.final_tally_result.yes),
    no: atoms(proposal.final_tally_result.no),
    abstain: atoms(proposal.final_tally_result.abstain),
    veto: atoms(proposal.final_tally_result.no_with_veto),
    total: totalVoted,
    totalVotedPercentage: getTotalVotedPercentage(
      proposal,
      totalBondedTokens,
      totalVoted
    )
  }
}

function proposalReducer(proposal, totalBondedTokens) {
  return {
    networkId: NETWORK_ID,
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

function validatorReducer(validator) {
  const statusInfo = getValidatorStatus(validator)
  let websiteURL = validator.description.website
  if (!websiteURL || websiteURL === '[do-not-modify]') {
    websiteURL = ''
  } else if (!websiteURL.match(/http[s]?/)) {
    websiteURL = `https://` + websiteURL
  }

  const hexAddr = decodeB32(validator.operator_address)
  const address = encodeB32(hexAddr, `cosmos`)

  return {
    networkId: NETWORK_ID,
    operatorAddress: validator.operator_address,
    consensusPubkey: validator.consensus_pubkey,
    address,
    jailed: validator.jailed,
    details: validator.description.details,
    website: websiteURL,
    identity: validator.description.identity,
    moniker: validator.description.moniker,
    votingPower: validator.voting_power || 0, // TODO,
    startHeight: validator.signing_info.start_height, // TODO
    uptimePercentage: 1, // TODO
    tokens: validator.tokens,
    updateTime: validator.commission.update_time,
    commission: validator.commission.rate,
    maxCommission: validator.commission.max_rate,
    maxChangeCommission: validator.commission.max_change_rate,
    status: statusInfo.status,
    statusDetailed: statusInfo.status_detailed,
    delegatorShares: validator.delegator_shares
  }
}

function blockReducer(block) {
  return {
    networkId: NETWORK_ID,
    height: block.block_meta.header.height,
    chainId: block.block_meta.header.chain_id,
    hash: block.block_meta.block_id.hash,
    time: block.block_meta.header.time,
    numTxs: block.block_meta.header.num_txs,
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

function delegationReducer(delegation) {
  if (delegation.error) {
    return {
      delegatorAddress: '',
      validatorAddress: '',
      shares: 0
    }
  }

  return {
    delegatorAddress: delegation.delegator_address,
    validatorAddress: delegation.validator_address,
    shares: delegation.shares
  }
}

function transactionReducer(transaction) {
  console.log(transaction)
  const result = {
    hash: transaction.txhash,
    height: Number(transaction.height),
    timestamp: transaction.timestamp,
    gasUsed: transaction.gas_used,
    gasWanted: transaction.gas_wanted,
    senderAddress: transaction.tx.value.msg[0].value.from_address,
    recipientAddress: transaction.tx.value.msg[0].value.to_address,
    amount: coinReducer(transaction.tx.value.msg[0].value.amount[0]),
    success: transaction.logs[0].success,
    log: transaction.logs[0].log,
    memo: transaction.tx.value.memo,
    fee: coinReducer(transaction.tx.value.fee.amount),
    signature: transaction.tx.value.signatures[0].signature
  }

  return result
}

function undelegationReducer(undelegation) {
  return {
    delegatorAddress: undelegation.delegator_address,
    validatorAddress: undelegation.validator_address,
    amount: undelegation.balance,
    startHeight: undelegation.creation_height,
    endTime: undelegation.min_time
  }
}

function rewardReducer(reward, validator) {
  return {
    amount: reward.amount,
    validatorAddress: validator.operator_address
  }
}

function overviewReducer(balances, delegations, rewards, stakingDenom) {
  stakingDenom = denomLookup(stakingDenom)

  const totalRewards = rewards.reduce(
    (sum, { amount }) => BigNumber(sum).plus(amount),
    0
  )
  const liquidStake = BigNumber(
    (balances.find(({ denom }) => denom === stakingDenom) || { amount: 0 })
      .amount
  )
  const delegatedStake = delegations.reduce(
    (sum, { amount }) => BigNumber(sum).plus(amount),
    0
  )

  return {
    // rewards,
    totalRewards,
    liquidStake,
    totalStake: liquidStake.plus(delegatedStake)
  }
}

function metadataReducer(stakingDenom) {
  return {
    stakingDenom: denomLookup(stakingDenom)
  }
}

module.exports = {
  proposalReducer,
  tallyReducer,
  validatorReducer,
  blockReducer,
  delegationReducer,
  coinReducer,
  transactionReducer,
  undelegationReducer,
  rewardReducer,
  overviewReducer,
  metadataReducer
}
