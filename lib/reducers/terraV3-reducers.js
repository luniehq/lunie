const cosmosV2Reducers = require('./cosmosV2-reducers')

// Terra has a slightly different structure and needs its own undelegationEndTimeReducer
function undelegationEndTimeReducer(transaction) {
  if (transaction.logs[0].events.length > 2) {
    let endTime
    const attributes = Object.values(transaction.logs[0].events).map(
      event => event.attributes
    )
    attributes.forEach(attribute =>
      attribute.map(tx => {
        if (tx.key === `completion_time`) {
          endTime = tx.value
        }
      })
    )
    return endTime ? endTime : null
  }
}

module.exports = {
  ...cosmosV2Reducers,
  undelegationEndTimeReducer
}
