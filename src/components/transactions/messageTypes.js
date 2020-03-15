const messageType = {
  SEND: "SendTx",
  STAKE: "StakeTx",
  RESTAKE: "RestakeTx",
  UNSTAKE: "UnstakeTx",
  SUBMIT_PROPOSAL: "SubmitProposalTx",
  DEPOSIT: "DepositTx",
  VOTE: "VoteTx",
  CLAIM_REWARDS: "ClaimRewardsTx",
  UNKNOWN: "UnknownTx"
}
const transactionGroup = {
  [messageType.SEND]: "banking",
  [messageType.MULTISEND]: "banking",
  [messageType.CREATE_VALIDATOR]: "staking",
  [messageType.EDIT_VALIDATOR]: "staking",
  [messageType.DELEGATE]: "staking",
  [messageType.UNDELEGATE]: "staking",
  [messageType.BEGIN_REDELEGATE]: "staking",
  [messageType.UNJAIL]: "staking",
  [messageType.SUBMIT_PROPOSAL]: "governance",
  [messageType.DEPOSIT]: "governance",
  [messageType.VOTE]: "governance",
  [messageType.SET_WITHDRAW_ADDRESS]: "distribution",
  [messageType.WITHDRAW_DELEGATION_REWARD]: "distribution"
}

export { messageType, transactionGroup }
