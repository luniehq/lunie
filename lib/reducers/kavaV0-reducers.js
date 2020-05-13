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

module.exports = {
  ...cosmosV2Reducers,
  delegationReducer
}
