const terraV3Reducers = require('./terraV3-reducers')
const BigNumber = require('bignumber.js')
const fetch = require('node-fetch')
const _ = require('lodash')
const EMoneyAPIUrl = `https://api.e-money.com/v1/`
const exchangeAPIURL = `https://api.exchangeratesapi.io/latest?`
const Sentry = require('@sentry/node')
const { atoms } = terraV3Reducers

async function totalBackedValueReducer(totalBackedValue) {
  const exchangeRates = await fetchTokenExchangeRates()
  const token = `e`.concat(totalBackedValue.denom.substring(1))
  const ticker = totalBackedValue.denom.substring(1).toUpperCase()
  // First we calculate the fiat net value of the token's total supply in it counterpart
  // fiat currency
  // TODO Not all the tokens have yet their rate value in the e-Money API. So the calculation
  // is not yet 100% accurate
  const fiatValue = exchangeRates[token]
    ? BigNumber(totalBackedValue.amount)
        .div(100000000)
        .times(exchangeRates[token][ticker])
        .toNumber()
    : null
  // Now that we have its net fiat value, we transform this value into euro
  const { rates } = await fetchFiatExchangeRates(`EUR`, ticker)
  const eurRate = ticker === `EUR` ? 1 : rates[ticker]
  return (totalBackedValue = {
    ...totalBackedValue,
    amount: exchangeRates[token]
      ? BigNumber(totalBackedValue.amount).times(
          Object.values(exchangeRates[token])[0]
        )
      : BigNumber(totalBackedValue.amount),
    // The total net EUR value of the token's total supply equals its net value in its
    // counterpart fiat currency times this fiat currency's EUR rate
    eurValue: fiatValue * eurRate
  })
}

async function fetchTokenExchangeRates() {
  return await fetch(`${EMoneyAPIUrl}rates.json`)
    .then(r => r.json())
    .catch(err => {
      Sentry.withScope(function(scope) {
        scope.setExtra('fetch', `${EMoneyAPIUrl}rates.json`)
        Sentry.captureException(err)
      })
    })
}

async function fetchFiatExchangeRates(selectedFiatCurrency, ticker) {
  return await fetch(
    `${exchangeAPIURL}base=${selectedFiatCurrency}&symbols=${ticker}`
  )
    .then(r => r.json())
    .catch(err => {
      Sentry.withScope(function(scope) {
        scope.setExtra(
          'fetch',
          `${exchangeAPIURL}base=${selectedFiatCurrency}&symbols=${ticker}`
        )
        Sentry.captureException(err)
      })
    })
}

async function expectedRewardsPerToken(
  validator,
  commission,
  inflations,
  totalBackedValues
) {
  const percentTotalStakedNGM = BigNumber(validator.votingPower).times(1000)
  const totalNGMStakedToValidator = validator.tokens
  const division = BigNumber(percentTotalStakedNGM)
    .times(BigNumber(1).minus(BigNumber(commission)))
    .div(BigNumber(totalNGMStakedToValidator))
  // Now we need to multiply each total supply of backed tokens with its corresponding
  // inflation
  let accumulator = BigNumber(0)
  const totalBackedValueDictionary = _.keyBy(totalBackedValues, 'denom')

  inflations.forEach(inflation => {
    accumulator = BigNumber(accumulator)
      .plus(accumulator)
      .plus(
        BigNumber(inflation.inflation)
          .times(totalBackedValueDictionary[inflation.denom].amount)
          .div(1000000)
      )
  })
  const totalBackedValuesTimesInflations = accumulator
  // First we calculate the total value of rewards we get for staking one single
  // NGM in this particular validator
  let delegatorSharePerToken = totalBackedValuesTimesInflations.div(division)
  // In testnet some validators have commission at 100% and therefore division is
  // equal to 0. Dividing by 0 we get infinity, and we want to make sure that
  // we don't display such value
  const infinity = new BigNumber(Infinity)
  // This is just how BigNumber works. Comparing to 0 and if true, bignumber equals the given parameter.
  // Documentation on this method can be found here: https://mikemcl.github.io/bignumber.js/#cmp
  delegatorSharePerToken =
    delegatorSharePerToken.comparedTo(infinity) === 0
      ? BigNumber(0)
      : delegatorSharePerToken.div(1000000)
  // Now we get the total net value in EUR of all token's total supplies
  let eurAccumulator = 0
  totalBackedValues.forEach(totalBackedValue => {
    eurAccumulator += totalBackedValue.eurValue
  })
  const totalEURGains = eurAccumulator * delegatorSharePerToken.toNumber()
  // How many NGM tokens can we buy with the total gain in EUR we make in a year's time?
  // 0.50€ is the price the NGM tokens will be first sold. Therefore, this is the official value
  // until they reach an exchange
  const pricePerNGM = 0.5
  const ngmGains = totalEURGains / pricePerNGM
  // We divide by 1 because we assume 1 NGM > gain per 1 NGM
  const expectedReturns = parseFloat(ngmGains / 1).toFixed(2)
  // TODO the FE is the one converting to percentage now, so we need to divide by 100
  return expectedReturns / 100
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
  ...terraV3Reducers,
  expectedRewardsPerToken,
  totalBackedValueReducer,
  rewardReducer
}
