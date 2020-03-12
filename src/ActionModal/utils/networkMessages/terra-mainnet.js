import * as CosmosMessages from "./cosmos-hub-mainnet.js"

export const MsgSend = (...args) => {
  const msg = CosmosMessages.MsgSend(...args)
  msg.type = "bank/MsgSend"
  return msg
}

export const MsgDelegate = (...args) => {
  const msg = CosmosMessages.MsgDelegate(...args)
  msg.type = "staking/MsgDelegate"
  return msg
}

export const MsgUndelegate = (...args) => {
  const msg = CosmosMessages.MsgUndelegate(...args)
  msg.type = "staking/MsgUndelegate"
  return msg
}

export const MsgRedelegate = (...args) => {
  const msg = CosmosMessages.MsgRedelegate(...args)
  msg.type = "staking/MsgBeginRedelegate"
  return msg
}

export const MsgWithdrawDelegationReward = (...args) => {
  const msg = CosmosMessages.MsgWithdrawDelegationReward(...args)
  msg.type = "distribution/MsgWithdrawDelegationReward"
  return msg
}

// No governance for now
