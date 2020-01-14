import * as CosmosMessages from "./cosmos-hub-mainnet.js"

export const MsgSend = (...args) => {
  const msg = CosmosMessages.MsgSend(...args)
  msg.type = "bank/MsgSend"
  return msg
}

// TODO all message types
