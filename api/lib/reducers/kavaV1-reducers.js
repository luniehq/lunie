const kavaV0Reducers = require('./kavaV0-reducers')

function setTransactionSuccess(transaction) {
  return transaction.code ? false : true
}

function blockReducer(networkId, block, transactions, data = {}) {
  return {
    id: block.block.header.last_block_id.hash,
    networkId,
    height: block.block.header.height,
    chainId: block.block.header.chain_id,
    // fix for now. This is actually last block's hash
    hash: block.block.header.last_block_id.hash,
    time: block.block.header.time,
    transactions,
    proposer_address: block.block.header.proposer_address,
    data: JSON.stringify(data)
  }
}

function accountInfoReducer(accountValue, accountType) {
  return {
    address: accountValue.address,
    accountNumber: accountValue.account_number,
    sequence: accountValue.sequence || 0,
    vestingAccount: accountType.includes(`VestingAccount`)
  }
}

module.exports = {
  ...kavaV0Reducers,
  setTransactionSuccess,
  blockReducer,
  accountInfoReducer
}
