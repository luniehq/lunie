const terraV3Reducers = require('./terraV3-reducers')
const BigNumber = require('bignumber.js')
const _ = require('lodash')

async function totalBackedValueReducer(
  totalBackedValue,
  exchangeRates,
  reducers
) {
  const aggregatingCurrency = `EUR`
  const lunieCoin = reducers.coinReducer(totalBackedValue)

  // The total net EUR value of the token's total supply
  const fiatValue = BigNumber(lunieCoin.amount)
    .times(exchangeRates[lunieCoin.denom][aggregatingCurrency])
    .toNumber()
  return {
    ...lunieCoin,
    eurValue: fiatValue
  }
}

async function getTotalNetworkAnnualRewards(inflations, totalBackedValues) {
  // Now we need to multiply each total supply of backed tokens with its corresponding
  // inflation
  const totalBackedValueDictionary = _.keyBy(
    totalBackedValues.map((totalBackedValue) => ({
      ...totalBackedValue,
      denom: totalBackedValue.denom.toLowerCase() // inflation response uses lower case denoms
    })),
    'denom'
  )
  const rewardsSumInEur = inflations.reduce((sum, inflation) => {
    return totalBackedValueDictionary[inflation.denom]
      ? BigNumber(sum).plus(
          BigNumber(inflation.inflation).times(
            totalBackedValueDictionary[inflation.denom].eurValue // we use the eur value to be able to sum up the individual token values
          )
        )
      : 0
  }, 0)

  return rewardsSumInEur
}

async function expectedRewardsPerToken(
  validator,
  commission,
  totalNetworkAnnualRewards,
  exchangeRates
) {
  const aggregatingCurrency = 'EUR'
  const stakingToken = 'NGM'

  const percentOfAllEligibleStake = validator.votingPower
  const totalStakeToValidator = validator.tokens // used to answer the question "How many rewards per ONE token invested?"
  const percentOfAllRewardsPerToken = BigNumber(percentOfAllEligibleStake)
    .times(BigNumber(1).minus(BigNumber(commission)))
    .div(BigNumber(totalStakeToValidator))

  // now we calculate the total rewards in eur per token delegated to the validator
  const totalEURGainsPerTokenInvested = BigNumber(
    totalNetworkAnnualRewards
  ).times(percentOfAllRewardsPerToken)

  // How many NGM tokens can we buy with the total gain in EUR we make in a year's time?
  // 0.50€ is the price the NGM tokens will be first sold. Therefore, this is the official value
  // until they reach an exchange
  const pricePerNGM = exchangeRates[stakingToken][aggregatingCurrency]
  const ngmGains = totalEURGainsPerTokenInvested.div(pricePerNGM)

  return ngmGains.toFixed(4) // we don't need more then a precision of 2 (0.1 = 10%)
}

function calculateTokenExchangeRates(
  supportedFiatCurrencies,
  emoneyTokenExchangeRates,
  fiatExchangeRates,
  reducers
) {
  return Object.entries(emoneyTokenExchangeRates).reduce(
    (all, [denom, emoneyTokenToFiatExchangeRate]) => {
      const [fiatCurrency, rate] = Object.entries(
        emoneyTokenToFiatExchangeRate
      )[0] // TODO dangerous if there will be more rates from the API directly
      // precalculate the exchange rates for all denom currency pairs
      supportedFiatCurrencies.forEach((supportedCurrency) => {
        all[reducers.denomLookup(denom)] =
          all[reducers.denomLookup(denom)] || {}
        all[reducers.denomLookup(denom)][supportedCurrency] =
          supportedCurrency === fiatCurrency
            ? rate
            : rate * fiatExchangeRates[fiatCurrency][supportedCurrency]
      })
      return all
    },
    {}
  )
}

module.exports = {
  ...terraV3Reducers,
  expectedRewardsPerToken,
  totalBackedValueReducer,
  getTotalNetworkAnnualRewards,
  calculateTokenExchangeRates
}
