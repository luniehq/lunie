const cosmosV3Reducers = require('./cosmosV3-reducers')
const cosmosV2Reducers = require('./cosmosV2-reducers')

function setTransactionSuccess(transaction) {
  return transaction.code ? false : true
}

function delegationReducer(delegation, validator, active, network) {
  const coinLookup = network.getCoinLookup(network, delegation.balance.denom)
  const { amount, denom } = cosmosV3Reducers.coinReducer(
    delegation.balance,
    coinLookup
  )

  return {
    id: delegation.validator_address.concat(`-${denom}`),
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount,
    active
  }
}

module.exports = {
  ...cosmosV3Reducers,
  validatorReducer: cosmosV2Reducers.validatorReducer,
  transactionReducerV2: cosmosV2Reducers.transactionReducerV2,
  delegationReducer,
  setTransactionSuccess
}
