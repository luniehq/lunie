const cosmosV2Reducers = require('./cosmosV2-reducers')
const { atoms, denomLookup, gasPriceReducer } = cosmosV2Reducers

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

function balanceReducer(coin, fiatValue, gasPrices) {
  return {
    ...coin,
    fiatValue: fiatValue || 0,
    gasPrice: gasPriceReducer(
      gasPrices.find(gasprice => denomLookup(gasprice.denom) === coin.denom)
    ).price
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
  formattedRewards.forEach(({ reward, validator }) =>
    reward.forEach(denomReward => {
      multiDenomRewardsArray.push({
        denom: denomLookup(denomReward.denom),
        amount: atoms(denomReward.amount),
        validator: validator
      })
    })
  )
  return multiDenomRewardsArray
}

module.exports = {
  ...cosmosV2Reducers,
  balanceReducer,
  rewardReducer,
  undelegationEndTimeReducer
}
