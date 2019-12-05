const messageType = {
  SEND: "cosmos-sdk/MsgSend",
  MULTISEND: "cosmos-sdk/MsgMultiSend",
  CREATE_VALIDATOR: "cosmos-sdk/MsgCreateValidator",
  EDIT_VALIDATOR: "cosmos-sdk/MsgEditValidator",
  DELEGATE: "cosmos-sdk/MsgDelegate",
  UNDELEGATE: "cosmos-sdk/MsgUndelegate",
  BEGIN_REDELEGATE: "cosmos-sdk/MsgBeginRedelegate",
  UNJAIL: "cosmos-sdk/MsgUnjail",
  SUBMIT_PROPOSAL: "cosmos-sdk/MsgSubmitProposal",
  DEPOSIT: "cosmos-sdk/MsgDeposit",
  VOTE: "cosmos-sdk/MsgVote",
  SET_WITHDRAW_ADDRESS: "cosmos-sdk/MsgSetWithdrawAddress",
  WITHDRAW_DELEGATION_REWARD: "cosmos-sdk/MsgWithdrawDelegationReward",
  WITHDRAW_VALIDATOR_COMMISSION: "cosmos-sdk/MsgWithdrawValidatorCommission"
}

export { messageType }
