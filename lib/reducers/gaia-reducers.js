const NETWORK_ID = "gaia-testnet";

function proposalReducer(proposal) {
  return {
    networkId: NETWORK_ID,
    id: Number(proposal.id),
    type: proposal.content.type,
    title: proposal.content.value.title,
    description: proposal.content.value.description,
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
  };
}

function validatorReducer(validator) {
  return {
    networkId: NETWORK_ID,
    operator_address: validator.operator_address,
    consensus_pubkey: validator.consensus_pubkey,
    jailed: validator.jailed,
    status: validator.status,
    tokens: validator.tokens,
    delegator_shares: validator.delegator_shares,
    moniker: validator.description.moniker,
    identity: validator.description.identity,
    website: validator.description.website,
    details: validator.description.details,
    bond_height: validator.bond_height,
    bond_intra_tx_counter: validator.bond_intra_tx_counter,
    unbonding_height: validator.unbonding_height,
    unbonding_time: validator.unbonding_time,
    rate: validator.rate,
    max_rate: validator.max_rate,
    max_change_rate: validator.max_change_rate,
    update_time: validator.update_time
  };
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
  };
}

module.exports = {
  proposalReducer,
  validatorReducer,
  blockReducer
};
