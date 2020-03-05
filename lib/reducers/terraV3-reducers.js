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
    amount: coin.amount,
    denom: correctTerraDenomsReducer(coin.denom),
    fiatValue: fiatValue
      ? {
          amount: fiatValue.amount || 0,
          denom: fiatValue.denom || '',
          symbol: fiatValue.symbol || ''
        }
      : null,
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
        denom: correctTerraDenomsReducer(denomLookup(denomReward.denom)),
        amount: atoms(denomReward.amount),
        validator: validator
      })
    })
  )
  return multiDenomRewardsArray
}

function correctTerraDenomsReducer(viewDenom) {
  const corrector = {
    KRW: 'KRT',
    SDR: 'SDT',
    USD: 'UST'
  }
  return corrector[viewDenom] ? corrector[viewDenom] : viewDenom
}

module.exports = {
  ...cosmosV2Reducers,
  balanceReducer,
  rewardReducer,
  undelegationEndTimeReducer
}
