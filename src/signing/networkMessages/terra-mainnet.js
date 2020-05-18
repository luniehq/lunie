import * as CosmosMessages from "./cosmos-hub-mainnet.js"

export const SendTx = (...args) => {
  const msg = CosmosMessages.SendTx(...args)
  msg.type = "bank/MsgSend"
  return msg
}

export const StakeTx = (...args) => {
  const msg = CosmosMessages.StakeTx(...args)
  msg.type = "staking/MsgDelegate"
  return msg
}

export const UnstakeTx = (...args) => {
  const msg = CosmosMessages.UnstakeTx(...args)
  msg.type = "staking/MsgUndelegate"
  return msg
}

export const RestakeTx = (...args) => {
  const msg = CosmosMessages.RestakeTx(...args)
  msg.type = "staking/MsgBeginRedelegate"
  return msg
}

export const ClaimRewardsTx = (...args) => {
  const msg = CosmosMessages.ClaimRewardsTx(...args)
  return msg.map(
    (msg) =>
      (msg = { ...msg, type: "distribution/MsgWithdrawDelegationReward" })
  )
}

export const SubmitProposalTx = (...args) => {
  const msg = CosmosMessages.SubmitProposalTx(...args)
  msg.type = "gov/MsgSubmitProposal"
  msg.value.content.type = "gov/TextProposal"
  return msg
}

export const VoteTx = (...args) => {
  const msg = CosmosMessages.VoteTx(...args)
  msg.type = "gov/MsgVote"
  return msg
}

export const DepositTx = (...args) => {
  const msg = CosmosMessages.DepositTx(...args)
  msg.type = "gov/MsgDeposit"
  return msg
}
