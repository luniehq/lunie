const NETWORK_ID = 'cosmoshub'

function proposalReducer(proposal) {
  return {
    networkId: NETWORK_ID,
    id: Number(proposal.proposal_id),
    type: proposal.proposal_content.type,
    title: proposal.proposal_content.value.title,
    description: proposal.proposal_content.value.description,
    status: proposal.proposal_status,
    final_tally_yes: proposal.final_tally_result.yes,
    final_tally_abstain: proposal.final_tally_result.abstain,
    final_tally_no: proposal.final_tally_result.no,
    final_tally_no_with_veto: proposal.final_tally_result.no_with_veto,
    submit_time: proposal.submit_time,
    deposit_end_time: proposal.deposit_end_time,
    total_deposit_denom: proposal.total_deposit.denom,
    total_deposit_amount: proposal.total_deposit.amount,
    voting_start_time: proposal.voting_start_time,
    voting_end_time: proposal.voting_end_time
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
    status: 'ACTIVE',
    status_detailed: 'inactive'
  }
}

function validatorReducer(validator) {
  const statusInfo = getValidatorStatus(validator)

  return {
    networkId: NETWORK_ID,
    operatorAddress: validator.operator_address,
    consensusPubkey: validator.consensus_pubkey,
    jailed: validator.jailed,
    details: validator.description.details,
    website: validator.description.website,
    identity: validator.description.identity,
    moniker: validator.description.moniker,
    votingPower: validator.voting_power, // TODO,
    startHeight: 1, // TODO
    uptimePercentage: 1, // TODO
    tokens: validator.tokens,
    updateTime: validator.commission.update_time,
    commission: validator.commission.rate,
    maxCommission: validator.commission.max_rate,
    maxChangeCommission: validator.commission.max_change_rate,
    status: statusInfo.status,
    status_detailed: statusInfo.status_detailed
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

function balanceReducer(balance) {
  return {
    denom: balance.denom,
    amount: balance.amount
  }
}

function delegationReducer(delegation) {
  return {
    delegatorAddress: delegation.delegator_address,
    validatorAddress: delegation.validator_address,
    shares: delegation.shares
  }
}

module.exports = {
  proposalReducer,
  validatorReducer,
  blockReducer,
  balanceReducer,
  delegationReducer
}
