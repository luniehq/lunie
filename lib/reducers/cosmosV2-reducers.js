const cosmosV0Reducers = require('./cosmosV0-reducers')
const {
  proposalBeginTime,
  proposalEndTime,
  getDeposit,
  tallyReducer,
  atoms,
  getValidatorStatus,
  expectedRewardsPerToken
} = cosmosV0Reducers

function proposalReducer(
  networkId,
  proposal,
  tally,
  proposer,
  totalBondedTokens
) {
  return {
    networkId,
    id: Number(proposal.id),
    type: proposal.content.type,
    title: proposal.content.value.title,
    description: proposal.content.value.description,
    creationTime: proposal.submit_time,
    status: proposal.proposal_status,
    statusBeginTime: proposalBeginTime(proposal),
    statusEndTime: proposalEndTime(proposal),
    tally: tallyReducer(proposal, tally, totalBondedTokens),
    deposit: getDeposit(proposal, 'stake'), // TODO use denom lookup + use network config
    proposer: proposer.proposer
  }
}

function delegationReducer(delegation, validator) {
  return {
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount: atoms(delegation.balance)
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
      Number(
        validator.signing_info
          ? validator.signing_info.missed_blocks_counter
          : 0
      ) /
        Number(signedBlocksWindow),
    tokens: atoms(validator.tokens),
    commissionUpdateTime: validator.commission.update_time,
    commission: validator.commission.commission_rates.rate,
    maxCommission: validator.commission.commission_rates.max_rate,
    maxChangeCommission: validator.commission.commission_rates.max_change_rate,
    status: statusInfo.status,
    statusDetailed: statusInfo.status_detailed,
    delegatorShares: validator.delegator_shares, // needed to calculate delegation token amounts from shares
    expectedReturns: expectedRewardsPerToken(
      validator,
      validator.commission.commission_rates.rate,
      annualProvision
    )
  }
}

function undelegationEndTimeReducer(transaction) {
  if (
    transaction.events[1].attributes.find(tx => tx.key === `completion_time`)
  ) {
    return transaction.events[1].attributes.filter(
      tx => tx.key === `completion_time`
    )[0].value
  } else {
    return null
  }
}

module.exports = {
  ...cosmosV0Reducers,
  proposalReducer,
  delegationReducer,
  validatorReducer,
  undelegationEndTimeReducer
}
