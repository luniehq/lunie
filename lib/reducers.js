function proposalReducer(proposal) {
  return {
    id: Number(proposal.proposal_id),
    type: proposal.proposal_content.type,
    title: proposal.proposal_content.value.title,
    description: proposal.proposal_content.value.description,
    status: proposal.proposal_status,
    final_tally_yes: proposal.final_tally_result.yes,
    final_tally_abstain: proposal.final_tally_result.abstain,
    final_tally_no: proposal.final_tally_result.no,
    final_tally_no_with_veto: proposal.final_tally_result.no_with_veto
  };
}

function validatorReducer(validator) {
  return {
    operator_address: validator.operator_address,
    consensus_pubkey: validator.consensus_pubkey,
    jailed: validator.jailed,
    status: validator.status,
    tokens: validator.tokens,
    delegator_shares: validator.delegator_shares,
    moniker: validator.moniker,
    identity: validator.identity,
    website: validator.website,
    details: validator.details,
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
