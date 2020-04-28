const cosmosV2Reducers = require('./cosmosV2-reducers')

function delegationReducer(delegation, validator) {
  return {
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount: cosmosV2Reducers.atoms(delegation.balance.amount)
  }
}

module.exports = {
  ...cosmosV2Reducers,
  delegationReducer
}
