const terraV3Reducers = require('./terraV3-reducers')
const BigNumber = require('bignumber.js')
const fetch = require('node-fetch')
const _ = require('lodash')
const EMoneyAPIUrl = `https://api.e-money.com/v1/`
const exchangeAPIURL = `https://api.exchangeratesapi.io/latest?`
const Sentry = require('@sentry/node')

async function totalBackedValueReducer(totalBackedValue) {
  const exchangeRates = await fetchTokenExchangeRates()
  const token = `e`.concat(totalBackedValue.denom.substring(1))
  const ticker = totalBackedValue.denom.substring(1).toUpperCase()
  // First we calculate the fiat net value of the token's total supply in it counterpart
  // fiat currency
  const fiatValue = exchangeRates[token]
    ? BigNumber(totalBackedValue.amount)
        .div(1000000)
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
  const percentOfAllEligibleStake = validator.votingPower
  const totalStakeToValidator = validator.tokens // used to answer the question "How many rewards per ONE token invested?"
  const percentOfAllRewardsPerToken = BigNumber(percentOfAllEligibleStake)
    .times(BigNumber(1).minus(BigNumber(commission)))
    .div(BigNumber(totalStakeToValidator))

  // Now we need to multiply each total supply of backed tokens with its corresponding
  // inflation
  const totalBackedValueDictionary = _.keyBy(totalBackedValues, 'denom')
  const rewardsSumInEur = inflations.reduce((sum, inflation) => {
    return BigNumber(sum).plus(
      BigNumber(inflation.inflation).times(
        totalBackedValueDictionary[inflation.denom].eurValue // we use the eur value to be able to sum up the individual token values
      )
    )
  }, 0)

  // now we calculate the total rewards in eur per token delegated to the validator
  const totalEURGainsPerTokenInvested = BigNumber(rewardsSumInEur).times(
    percentOfAllRewardsPerToken
  )

  // How many NGM tokens can we buy with the total gain in EUR we make in a year's time?
  // 0.50€ is the price the NGM tokens will be first sold. Therefore, this is the official value
  // until they reach an exchange
  const pricePerNGM = 0.5
  const ngmGains = totalEURGainsPerTokenInvested / pricePerNGM

  return ngmGains.toFixed(4) // we don't need more then a precision of 2 (0.1 = 10%)
}

module.exports = {
  ...terraV3Reducers,
  expectedRewardsPerToken,
  fetchTokenExchangeRates,
  totalBackedValueReducer
}
