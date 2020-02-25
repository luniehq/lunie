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
  [messageType.STAKE]: "staking",
  [messageType.RESTAKE]: "staking",
  [messageType.UNSTAKE]: "staking",
  [messageType.SUBMIT_PROPOSAL]: "governance",
  [messageType.DEPOSIT]: "governance",
  [messageType.VOTE]: "governance",
  [messageType.CLAIM_REWARDS]: "staking"
}

const getTransactionGroup = group => transactionGroup[group]

export { messageType, transactionGroup, getTransactionGroup }
