const messageType = {
  SEND: "MsgSend",
  MULTISEND: "MsgMultiSend",
  DELEGATE: "MsgDelegate",
  UNDELEGATE: "MsgUndelegate",
  BEGIN_REDELEGATE: "MsgBeginRedelegate",
  SUBMIT_PROPOSAL: "MsgSubmitProposal",
  DEPOSIT: "MsgDeposit",
  VOTE: "MsgVote",
  WITHDRAW_DELEGATION_REWARD: "MsgWithdrawDelegationReward"
}

const transactionGroup = {
  [messageType.SEND]: "banking",
  [messageType.MULTISEND]: "banking",
  [messageType.DELEGATE]: "staking",
  [messageType.UNDELEGATE]: "staking",
  [messageType.BEGIN_REDELEGATE]: "staking",
  [messageType.SUBMIT_PROPOSAL]: "governance",
  [messageType.DEPOSIT]: "governance",
  [messageType.VOTE]: "governance",
  [messageType.WITHDRAW_DELEGATION_REWARD]: "distribution"
}

export { messageType, transactionGroup }
