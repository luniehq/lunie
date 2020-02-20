const cosmosV2Reducers = require('./cosmosV2-reducers')
const BigNumber = require('bignumber.js')
const { atoms, denomLookup } = cosmosV2Reducers

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

function gasPriceReducer(gasPrice) {
  if (!gasPrice) {
    throw new Error(
      'The token you are trying to request data for is not supported by Lunie.'
    )
  }

  // we want to show only atoms as this is what users know
  const denom = denomLookup(gasPrice.denom)
  return {
    denom: denom,
    price: BigNumber(gasPrice.price).div(1000000) // Danger: this might not be the case for all future tokens
  }
}

function balanceReducer(coin, fiatValue, gasPrices) {
  return {
    ...coin,
    fiatValue,
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
