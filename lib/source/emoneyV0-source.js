const TerraV3API = require('./terraV3-source')
const CosmosV0API = require('./cosmosV0-source')
const fetch = require('node-fetch')
const Sentry = require('@sentry/node')

const fiatExchangeRateApi = `https://api.exchangeratesapi.io/latest?`
const EMoneyAPIUrlMainnet = `https://api.e-money.com/v1/`
const EMoneyAPIUrlTestnet = `https://beta-api.e-money.com/v1/`
const gasPrices = [
  {
    denom: 'echf',
    price: '0.400'
  },
  {
    denom: 'eeur',
    price: '0.400'
  },
  {
    denom: 'ejpy',
    price: '48.800'
  },
  {
    denom: 'eusd',
    price: '0.440'
  },
  {
    denom: 'ungm',
    price: '1'
  },
  {
    denom: 'esek',
    price: '0.400'
  },
  {
    denom: 'enok',
    price: '0.400'
  },
  {
    denom: 'edkk',
    price: '0.400'
  }
]
const supportedFiatCurrencies = new Set([
  'EUR',
  'USD',
  'GBP',
  'CHF',
  'JPY',
  'DKK',
  'NOK',
  'SEK'
])

class EMoneyV0API extends TerraV3API {
  setReducers() {
    this.reducers = require('../reducers/emoneyV0-reducers')
    this.gasPrices = gasPrices
    this.apiURL =
      this.network.id === 'emoney-mainnet'
        ? EMoneyAPIUrlMainnet
        : EMoneyAPIUrlTestnet
  }

  // additional block handling by network
  async newBlockHandler(block, store) {
    try {
      // update exchange rates every 5 minutes
      if (
        !store.exchangeRatesUpdating &&
        (!store.exchangeRatesUpdate ||
          Date.now() - new Date(store.exchangeRatesUpdate).getTime() >
            5 * 60 * 1000)
      ) {
        store.exchangeRatesUpdating = true

        const [fiatExchangeRates, tokenExchangeRates] = await Promise.all([
          this.fetchFiatExchangeRates(),
          this.fetchEmoneyTokenExchangeRates.call(this)
        ])
        this.store.exchangeRates = this.reducers.calculateTokenExchangeRates(
          supportedFiatCurrencies,
          tokenExchangeRates,
          fiatExchangeRates,
          this.reducers
        )

        await Promise.all([
          this.getTokensInflations(),
          this.getTotalBackedValues()
        ]).then(async ([inflations, totalBackedValues]) => {
          store.totalNetworkAnnualRewards = await this.reducers.getTotalNetworkAnnualRewards(
            inflations,
            totalBackedValues
          )
        })

        // eslint-disable-next-line require-atomic-updates
        store.exchangeRatesUpdating = false
        // eslint-disable-next-line require-atomic-updates
        store.exchangeRatesUpdate = Date.now()
      }
    } catch (error) {
      console.error('EMoney block handler failed', error)
      Sentry.captureException(error)
    }
  }

  // Here we query for the current inflation rates for all the backed tokens
  async getTokensInflations() {
    const inflations = await this.get(`inflation/current`)
    return inflations.result.assets
  }

  // Here we query for the current total supply for all the backed tokens
  // We filter NGM tokens out
  async getTotalBackedValues() {
    let totalBackedValues = await this.get(`supply/total`)
    totalBackedValues = totalBackedValues.result.filter(
      asset => !asset.denom.includes(`ngm`)
    )
    const mapTotalBackedValues = async () => {
      return Promise.all(
        totalBackedValues.map(totalBackedValue =>
          this.reducers.totalBackedValueReducer(
            totalBackedValue,
            this.store.exchangeRates,
            this.reducers
          )
        )
      )
    }
    const resolvedBackedValues = await mapTotalBackedValues()
    return resolvedBackedValues
  }

  getAnnualProvision() {
    return 0
  }

  async getAllValidators(height) {
    return CosmosV0API.prototype.getAllValidators.call(this, height)
  }

  async getExpectedReturns(validator) {
    // Right now we are displaying only the EUR value of expected returns
    const expectedReturns = this.reducers.expectedRewardsPerToken(
      validator,
      validator.commission,
      this.store.totalNetworkAnnualRewards,
      this.store.exchangeRates
    )
    return expectedReturns
  }

  // This function takes microunits as inputs

  // Currently this function only works for e-Money and is very e-Money centered.
  // But soon will also be enabled for other similar multiple-tokens networks like Terra.

  // We just default to EUR if there is no fiat currency included in the query
  // This is because the standard price for NGM tokens given by e-Money team is 0.50€
  async calculateFiatValue(lunieCoin, selectedFiatCurrency = `EUR`) {
    // when fiatCurrency is set in the query as "" or null it doesn't get the default value
    if (!selectedFiatCurrency) selectedFiatCurrency = `EUR`

    // firt check if the selectedFiatCurrency is a supported currency
    if (!supportedFiatCurrencies.has(selectedFiatCurrency)) {
      throw new Error(
        'We currently only support "EUR", "USD", "GBP", "DKK", "NOK", "SEK", "CHF" and "JPY" as fiat currencies. Remember they should be written in uppercases'
      )
    }

    const exchangeRate = this.store.exchangeRates[lunieCoin.denom][
      selectedFiatCurrency
    ]
    const totalAsFiat = lunieCoin.amount * exchangeRate

    // Finally we get the proper currency sign to display
    const currencySign = this.getCurrencySign(selectedFiatCurrency)
    return {
      amount: parseFloat(totalAsFiat).toFixed(2),
      denom: selectedFiatCurrency,
      symbol: currencySign
    }
  }

  async fetchEmoneyTokenExchangeRates() {
    const rates = await fetch(`${this.apiURL}rates.json`)
      .then(r => r.json())
      .catch(err => {
        Sentry.withScope(function(scope) {
          scope.setExtra('fetch', `${this.apiURL}rates.json`)
          Sentry.captureException(err)
        })
      })
    rates['NGM'] = { EUR: 0.5 }
    return rates
  }

  async fetchFiatExchangeRates() {
    let all = {}
    await Promise.all(
      Array.from(supportedFiatCurrencies).map(async fiatCurrency => {
        const { rates } = await fetch(
          `${fiatExchangeRateApi}base=${fiatCurrency}`
        )
          .then(r => r.json())
          .catch(error => console.error(error))
        all[fiatCurrency] = rates
      })
    )

    return all
  }

  getCurrencySign(currency) {
    switch (currency) {
      case `EUR`:
        return `€`
      case `USD`:
        return `$`
      case `GBP`:
        return `£`
      case `CHF`:
        return `Fr`
      case `JPY`:
        return `¥`
      case `DKK`:
      case `SEK`:
      case `NOK`:
        return `kr`
      default:
        return `?`
    }
  }
}

module.exports = EMoneyV0API
