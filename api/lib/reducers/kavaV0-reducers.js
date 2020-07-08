const cosmosV2Reducers = require('./cosmosV2-reducers')
const { lunieMessageTypes } = require('../../lib/message-types')

function delegationReducer(delegation, validator) {
  return {
    id: delegation.validator_address,
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount: delegation.balance
      ? cosmosV2Reducers.atoms(delegation.balance.amount)
      : 0
  }
}

function getMessageType(type) {
  // kava is weird. they have a kava/MsgSubmitProposal that is a completely different transaction and a
  // cdp/MsgDeposit that is as well
  switch (type) {
    case 'cosmos-sdk/MsgSend':
      return lunieMessageTypes.SEND
    case 'cosmos-sdk/MsgDelegate':
      return lunieMessageTypes.STAKE
    case 'cosmos-sdk/MsgBeginRedelegate':
      return lunieMessageTypes.RESTAKE
    case 'cosmos-sdk/MsgUndelegate':
      return lunieMessageTypes.UNSTAKE
    case 'cosmos-sdk/MsgWithdrawDelegationReward':
      return lunieMessageTypes.CLAIM_REWARDS
    case 'cosmos-sdk/MsgSubmitProposal':
      return lunieMessageTypes.SUBMIT_PROPOSAL
    case 'cosmos-sdk/MsgVote':
      return lunieMessageTypes.VOTE
    case 'cosmos-sdk/MsgDeposit':
      return lunieMessageTypes.DEPOSIT
    // all the weid kava new types go to Unknown
    default:
      return lunieMessageTypes.UNKNOWN
  }
}

module.exports = {
  ...cosmosV2Reducers,
  delegationReducer,
  getMessageType
}
