import * as CosmosMessages from "./cosmos-hub-mainnet.js"

export const SendTx = (...args) => {
  const msg = CosmosMessages.SendTx(...args)
  msg.type = "cosmos.bank.v1beta1.MsgSend"
  return msg
}

export const StakeTx = (...args) => {
  const msg = CosmosMessages.StakeTx(...args)
  msg.type = "cosmos.staking.v1beta1.MsgDelegate"
  return msg
}

export const UnstakeTx = (...args) => {
  const msg = CosmosMessages.UnstakeTx(...args)
  msg.type = "cosmos.staking.v1beta1.MsgUndelegate"
  return msg
}

export const RestakeTx = (...args) => {
  const msg = CosmosMessages.RestakeTx(...args)
  msg.type = "cosmos.staking.v1beta1.MsgBeginRedelegate"
  return msg
}

export const ClaimRewardsTx = (...args) => {
  const msg = CosmosMessages.ClaimRewardsTx(...args)
  return msg.map(
    (msg) =>
      (msg = { ...msg, type: "cosmos.distribution.v1beta1.MsgWithdrawDelegationReward" })
  )
}

export const SubmitProposalTx = (...args) => {
  const msg = CosmosMessages.SubmitProposalTx(...args)
  msg.type = "cosmos.gov.v1beta1.MsgSubmitProposal"
  msg.value.content.type = "gov/TextProposal"
  return msg
}

export const VoteTx = (...args) => {
  const msg = CosmosMessages.VoteTx(...args)
  msg.type = "cosmos.gov.v1beta1.MsgVote"
  return msg
}

export const DepositTx = (...args) => {
  const msg = CosmosMessages.DepositTx(...args)
  msg.type = "cosmos.gov.v1beta1.MsgDeposit"
  return msg
}
