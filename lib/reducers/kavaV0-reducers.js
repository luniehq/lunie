const cosmosV2Reducers = require('./cosmosV2-reducers')

function delegationReducer(delegation, validator) {
  return {
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount: delegation.balance
      ? cosmosV2Reducers.atoms(delegation.balance.amount)
      : 0
  }
}

function depositDetailsReducer(message, reducers) {
  if (!message.amount) {
    // kava-testnet issue. They have a "cdp/MsgDeposit" message type. Hopefully will change in mainnet
    return {}
  }
  return {
    proposalId: message.proposal_id,
    amount: reducers.coinReducer(message.amount[0])
  }
}

// TODO: probably unify when new mainnet
function blockReducer(networkId, block, transactions) {
  return {
    networkId,
    height: block.block.header.height,
    chainId: block.block.header.chain_id,
    hash:
      networkId === 'kava-testnet'
        ? block.block_id.hash
        : block.block_meta.block_id.hash,
    time: block.block.header.time,
    transactions,
    proposer_address: block.block.header.proposer_address
  }
}

module.exports = {
  ...cosmosV2Reducers,
  delegationReducer,
  depositDetailsReducer,
  blockReducer
}
