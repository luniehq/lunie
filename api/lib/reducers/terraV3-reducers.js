const cosmosV2Reducers = require('./cosmosV2-reducers')

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

module.exports = {
  ...cosmosV2Reducers,
  undelegationEndTimeReducer
}
