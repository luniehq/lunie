const terraV3Reducers = require('./terraV3-reducers')
const cosmosV3Reducers = require('./cosmosV3-reducers')

function calculateTokenExchangeRates(
  supportedFiatCurrencies,
  emoneyTokenExchangeRates,
  fiatExchangeRates,
  reducers,
  network
) {
  return Object.entries(emoneyTokenExchangeRates).reduce(
    (all, [denom, emoneyTokenToFiatExchangeRate]) => {
      const [fiatCurrency, rate] = Object.entries(
        emoneyTokenToFiatExchangeRate
      )[0] // TODO dangerous if there will be more rates from the API directly
      // precalculate the exchange rates for all denom currency pairs
      supportedFiatCurrencies.forEach((supportedCurrency) => {
        all[reducers.denomLookup(network.coinLookup, denom)] =
          all[reducers.denomLookup(network.coinLookup, denom)] || {}
        all[reducers.denomLookup(network.coinLookup, denom)][
          supportedCurrency
        ] =
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
  blockReducer: cosmosV3Reducers.blockReducer,
  setTransactionSuccess: cosmosV3Reducers.setTransactionSuccess,
  accountInfoReducer: cosmosV3Reducers.accountInfoReducer,
  delegationReducer: cosmosV3Reducers.delegationReducer,
  calculateTokenExchangeRates
}
