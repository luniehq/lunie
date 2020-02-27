const cosmosMessageType = {
  SEND: 'cosmos-sdk/MsgSend',
  CREATE_VALIDATOR: 'cosmos-sdk/MsgCreateValidator',
  EDIT_VALIDATOR: 'cosmos-sdk/MsgEditValidator',
  DELEGATE: 'cosmos-sdk/MsgDelegate',
  UNDELEGATE: 'cosmos-sdk/MsgUndelegate',
  BEGIN_REDELEGATE: 'cosmos-sdk/MsgBeginRedelegate',
  UNJAIL: 'cosmos-sdk/MsgUnjail',
  SUBMIT_PROPOSAL: 'cosmos-sdk/MsgSubmitProposal',
  DEPOSIT: 'cosmos-sdk/MsgDeposit',
  VOTE: 'cosmos-sdk/MsgVote',
  SET_WITHDRAW_ADDRESS: 'cosmos-sdk/MsgSetWithdrawAddress',
  WITHDRAW_DELEGATION_REWARD: 'cosmos-sdk/MsgWithdrawDelegationReward',
  WITHDRAW_VALIDATOR_COMMISSION: 'cosmos-sdk/MsgWithdrawValidatorCommission',
  MULTI_SEND: 'cosmos-sdk/MsgMultiSend'
}

const cosmosWhitelistedMessageTypes = new Set([
  `MsgSend`,
  `MsgDelegate`,
  `MsgBeginRedelegate`,
  `MsgUndelegate`,
  `MsgVote`,
  `MsgDeposit`,
  `MsgWithdrawDelegationReward`,
  `MsgSubmitProposal`,
  `MsgMultiSend`
])

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
  cosmosMessageType,
  cosmosWhitelistedMessageTypes,
  lunieMessageTypes
}
