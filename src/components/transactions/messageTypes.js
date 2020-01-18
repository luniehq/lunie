const messageType = {
  SEND: "MsgSend",
  MULTISEND: "MsgMultiSend",
  CREATE_VALIDATOR: "MsgCreateValidator",
  EDIT_VALIDATOR: "MsgEditValidator",
  DELEGATE: "MsgDelegate",
  UNDELEGATE: "MsgUndelegate",
  BEGIN_REDELEGATE: "MsgBeginRedelegate",
  UNJAIL: "MsgUnjail",
  SUBMIT_PROPOSAL: "MsgSubmitProposal",
  DEPOSIT: "MsgDeposit",
  VOTE: "MsgVote",
  SET_WITHDRAW_ADDRESS: "MsgSetWithdrawAddress",
  WITHDRAW_DELEGATION_REWARD: "MsgWithdrawDelegationReward"
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
