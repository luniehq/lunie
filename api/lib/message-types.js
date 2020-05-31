const lunieMessageTypes = {
  SEND: `SendTx`,
  STAKE: `StakeTx`,
  RESTAKE: `RestakeTx`,
  UNSTAKE: `UnstakeTx`,
  VOTE: `VoteTx`,
  DEPOSIT: `DepositTx`,
  CLAIM_REWARDS: `ClaimRewardsTx`,
  SUBMIT_PROPOSAL: `SubmitProposalTx`,
  UNKNOWN: `UnknownTx`
}

module.exports = {
  lunieMessageTypes
}
