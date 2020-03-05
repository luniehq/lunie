const TerraV3API = require('./terraV3-source')
const CosmosV0API = require('./cosmosV0-source')
const BigNumber = require('bignumber.js')
const fetch = require('node-fetch')
const apiURL = `https://api.exchangeratesapi.io/latest?`

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
    price: '0.800'
  }
]
const supportedFiatCurrencies = new Set(['EUR', 'USD', 'GBP', 'CHF', 'JPY'])

class EMoneyV0API extends TerraV3API {
  setReducers() {
    this.reducers = require('../reducers/emoneyV0-reducers')
    this.gasPrices = gasPrices
  }

  // Here we query for the current inflation rates for all the backed tokens
  async getTokensInflations() {
    const inflations = await this.get(`inflation/current`)
    return inflations.result.assets.filter(asset => asset.denom !== `x3chf`)
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
          this.reducers.totalBackedValueReducer(totalBackedValue)
        )
      )
    }
    return await mapTotalBackedValues()
  }

  getAnnualProvision() {
    return 0
  }

  async getAllValidators() {
    return CosmosV0API.prototype.getAllValidators.call(this)
  }

  async getExpectedReturns(validator) {
    const inflations = await this.getTokensInflations()
    const totalBackedValues = await this.getTotalBackedValues()
    // Right now we are displaying only the EUR value of expected returns
    const expectedReturns = this.reducers.expectedRewardsPerToken(
      validator,
      validator.commission,
      inflations,
      totalBackedValues
    )
    return expectedReturns
  }

  // This function takes microunits as inputs

  // Currently this function only works for e-Money and is very e-Money centered.
  // But soon will also be enabled for other similar multiple-tokens networks like Terra.

  // We just default to EUR if there is no fiat currency included in the query
  // This is because the standard price for NGM tokens given by e-Money team is 0.50€
  async calculateFiatValue(balance, selectedFiatCurrency = `EUR`) {
    // firt check if the selectedFiatCurrency is a supported currency
    if (!supportedFiatCurrencies.has(selectedFiatCurrency)) {
      throw new Error(
        'We currently only support "EUR", "USD", "GBP", "CHF" and "JPY" as fiat currencies. Remember they should be written in uppercases'
      )
    }

    // When e-Money goes live they will count with a trading platform where the value
    // for the different backed tokens will be changing slightly.
    // They will provide with an API for us to query these values.
    // For now we will assume a 1:1 ratio and treat each token like it were the real
    // fiat currency it represents.
    const denom = balance.denom.substring(1).toUpperCase()

    // To handle the NGM balance, first we convert to EUR value and then to the selected
    // fiat currency value
    if (denom === 'NGM') {
      const eurValue = this.reducers.coinReducer(balance).amount * 0.5 // 0.50€ is the price the NGM tokens will be first sold. Therefore, the official value until they reach an exchange
      if (selectedFiatCurrency === `EUR`) {
        return {
          amount: parseFloat(eurValue).toFixed(2),
          denom: `EUR`,
          symbol: `€`
        }
      } else {
        const { rates } = await this.fetchExchangeRates(
          selectedFiatCurrency,
          `EUR`
        )
        const fiatValue = eurValue / rates[`EUR`]
        const currencySign = this.getCurrencySign(selectedFiatCurrency)
        return {
          amount: parseFloat(fiatValue).toFixed(2),
          denom: selectedFiatCurrency,
          symbol: currencySign
        }
      }
      // For all other balances we use the public API https://exchangeratesapi.io/ to add all balances into
      // a single fiat currency value, the selectedFiatCurrency
    } else {
      const { rates } = await this.fetchExchangeRates(
        selectedFiatCurrency,
        denom
      )
      let totalAsFiat = 0
      // Here we check if the balance we are currently calculating the total fiat value from is
      // the same currency we want the fiat value to be displayed in.
      // In that case, we simply add it, don't need to convert it.
      if (denom !== selectedFiatCurrency) {
        totalAsFiat = this.reducers.coinReducer(balance).amount / rates[denom]
      } else {
        totalAsFiat = this.reducers.coinReducer(balance).amount
      }
      // Now we do total value in the selected currency times the token fiat value
      const totalFiatValue = await this.convertFiatValueToTokenFiatValue(
        totalAsFiat,
        denom
      )
      // Finally we get the proper currency sign to display
      const currencySign = this.getCurrencySign(selectedFiatCurrency)
      return {
        amount: parseFloat(totalFiatValue).toFixed(2),
        denom: selectedFiatCurrency,
        symbol: currencySign
      }
    }
  }

  async fetchExchangeRates(selectedFiatCurrency, ticker) {
    return await fetch(
      `${apiURL}base=${selectedFiatCurrency}&symbols=${ticker}`
    )
      .then(r => r.json())
      .catch(error => console.error(error))
  }

  async convertFiatValueToTokenFiatValue(totalAsFiat, denom) {
    const tokenExchangeRates = await this.reducers.fetchTokenExchangeRates()
    const tokenExchangeRatesArray = Object.values(tokenExchangeRates)
    const filterDenomFromExchangeRates = tokenExchangeRatesArray.filter(
      rate => Object.keys(rate)[0] === denom
    )[0]
    const selectedFiatCurrencyExchangeRate = Object.values(
      filterDenomFromExchangeRates
    )[0]
    return BigNumber(totalAsFiat)
      .times(selectedFiatCurrencyExchangeRate)
      .toNumber()
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
      default:
        return `?`
    }
  }
}

module.exports = EMoneyV0API
