const cosmosV0Reducers = require('./cosmosV0-reducers')
const {
  proposalBeginTime,
  proposalEndTime,
  getDeposit,
  tallyReducer,
  atoms,
  getValidatorStatus
} = cosmosV0Reducers

function proposalReducer(networkId, proposal, totalBondedTokens) {
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
    tally: tallyReducer(proposal, totalBondedTokens),
    deposit: getDeposit(proposal, 'stake') // TODO use denom lookup + use network config
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

function validatorReducer(networkId, signedBlocksWindow, validator) {
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
    expectedReturns: validator.expected_returns
  }
}

module.exports = {
  ...cosmosV0Reducers,
  proposalReducer,
  delegationReducer,
  validatorReducer
}
