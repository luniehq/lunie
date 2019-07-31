const messageTypes = {
  SEND: "cosmos-sdk/MsgSend",
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

export const transactionGroup = {
  "cosmos-sdk/MsgSend": "banking",
  "cosmos-sdk/MsgCreateValidator": "staking",
  "cosmos-sdk/MsgEditValidator": "staking",
  "cosmos-sdk/MsgDelegate": "staking",
  "cosmos-sdk/MsgUndelegate": "staking",
  "cosmos-sdk/MsgBeginRedelegate": "staking",
  "cosmos-sdk/MsgUnjail": "staking",
  "cosmos-sdk/MsgSubmitProposal": "governance",
  "cosmos-sdk/MsgDeposit": "governance",
  "cosmos-sdk/MsgVote": "governance",
  "cosmos-sdk/MsgSetWithdrawAddress": "distribution",
  "cosmos-sdk/MsgWithdrawDelegationReward": "distribution",
  "cosmos-sdk/MsgWithdrawValidatorCommission": "distribution"
}

export default messageTypes
