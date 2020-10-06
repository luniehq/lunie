const cosmosV3Reducers = require('./cosmosV3-reducers')
const cosmosV2Reducers = require('./cosmosV2-reducers')
const { coinReducer } = require('./cosmosV0-reducers')

// Terra has a slightly different structure and needs its own undelegationEndTimeReducer
function undelegationEndTimeReducer(transaction) {
  if (transaction.logs) {
    let completionTimeAttribute
    transaction.logs.find(({ events }) => {
      if (events) {
        events.find(({ attributes }) => {
          if (attributes) {
            completionTimeAttribute = attributes.find(
              (tx) => tx.key === `completion_time`
            )
          }
          return !!completionTimeAttribute
        })
      }
      return !!completionTimeAttribute
    })
    return completionTimeAttribute ? completionTimeAttribute.value : undefined
  } else {
    return null
  }
}

function delegationReducer(delegation, validator, active, network) {
  const coinLookup = network.getCoinLookup(network, delegation.balance.denom)
  const { amount, denom } = coinReducer(delegation.balance, coinLookup)

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
  ...cosmosV2Reducers,
  blockReducer: cosmosV3Reducers.blockReducer,
  setTransactionSuccess: cosmosV3Reducers.setTransactionSuccess,
  undelegationEndTimeReducer,
  delegationReducer
}
