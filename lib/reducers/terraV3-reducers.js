const cosmosV2Reducers = require('./cosmosV2-reducers')
const { atoms } = cosmosV2Reducers

// Terra has a slightly different structure and needs its own undelegationEndTimeReducer
function undelegationEndTimeReducer(transaction) {
  if (transaction.logs) {
    let completionTimeAttribute
    transaction.logs.find(({ events }) => {
      if (events) {
        events.find(({ attributes }) => {
          if (attributes) {
            completionTimeAttribute = attributes.find(
              tx => tx.key === `completion_time`
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

function rewardReducer(rewards, validatorsDictionary) {
  const formattedRewards = rewards.map(
    reward =>
      (reward = {
        reward: reward.reward,
        validator: validatorsDictionary[reward.validator_address]
      })
  )
  let multiDenomRewardsArray = []
  formattedRewards.map(({ reward, validator }) =>
    reward.forEach(denomReward => {
      multiDenomRewardsArray.push({
        denom: denomReward.denom,
        amount: atoms(denomReward.amount),
        validator: validator
      })
    })
  )
  return multiDenomRewardsArray
}

module.exports = {
  ...cosmosV2Reducers,
  rewardReducer,
  undelegationEndTimeReducer
}
