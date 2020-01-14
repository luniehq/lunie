const TerraV3API = require('./terraV3-source')
const BigNumber = require('bignumber.js')
const fetch = require('node-fetch')
const apiURL = `https://api.exchangeratesapi.io/latest?`
const { UserInputError } = require('apollo-server')
// This is just a dummy value.
// It is kind of difficult to calculate the expected returns for e-Money since it is
// planned that the issuance of the fiat-backed tokens varies within one same year.
const totalBackedValueEUR = '100000'
// E-Money has a fixed inflation of 1% for fiat-backed tokens
const inflation = 0.01

class EMoneyV0API extends TerraV3API {
  setReducers() {
    this.reducers = require('../reducers/emoneyV0-reducers')
  }

  async getExpectedReturns(validator) {
    // Right now we are displaying only the EUR value of expected returns
    const expectedReturns = this.reducers.expectedRewardsPerToken(
      validator,
      validator.commission,
      inflation,
      totalBackedValueEUR
    )
    return expectedReturns
  }

  // Currently this function only works for e-Money and is very e-Money centered.
  // But soon will also be enabled for other similar multiple-tokens networks like Terra.
  async calculateFiatValue(balance, selectedFiatCurrency) {
    if (!selectedFiatCurrency) {
      throw new UserInputError(
        `No fiatCurrency selected. Please, enter the fiat currency you'd like the fiat value to be displayed in`
      )
    }
    // When e-Money goes live they will count with a trading platform where the value
    // for the different backed tokens will be changing slightly.
    // They will provide with an API for us to query these values.
    // For now we will assume a 1:1 ratio and treat each token like it were the real
    // fiat currency it represents.
    const denom = balance.denom.substring(2).toUpperCase()

    // To handle the NGM balance, first we convert to EUR value and then to the selected
    // fiat currency value
    if (denom === 'NGM') {
      const eurValue =
        BigNumber(balance.amount)
          .div(100000000)
          .toNumber() * 0.5 // 0.50€ is the price the NGM tokens will be first sold. Therefore, the official value until they reach an exchange
      if (selectedFiatCurrency === `EUR`) {
        return parseFloat(eurValue)
          .toFixed(6)
          .toString()
          .concat(`€`)
      } else {
        const { rates } = await this.fetchExchangeRates(
          selectedFiatCurrency,
          `EUR`
        )
        const fiatValue = eurValue / rates[selectedFiatCurrency]
        const currencySign = this.getCurrencySign(selectedFiatCurrency)
        return parseFloat(fiatValue)
          .toFixed(6)
          .toString()
          .concat(`${currencySign}`)
      }
      // For all other balances we use the public API https://exchangeratesapi.io/ to add all balances into
      // a single fiat currency value, the selectedFiatCurrency
    } else {
      const { rates } = await this.fetchExchangeRates(
        selectedFiatCurrency,
        denom
      )
      let totalFiatValue = 0
      // Here we check if the balance we are currently calculating the total fiat value from is
      // the same currency we want the fiat value to be displayed in.
      // In that case, we simply add it, don't need to convert it.
      if (denom !== selectedFiatCurrency) {
        totalFiatValue =
          BigNumber(balance.amount)
            .div(100000000)
            .toNumber() / rates[denom]
      } else {
        totalFiatValue = BigNumber(balance.amount)
          .div(100000000)
          .toNumber()
      }
      // Finally we get the proper currency sign to display
      const currencySign = this.getCurrencySign(selectedFiatCurrency)
      return parseFloat(totalFiatValue)
        .toFixed(6)
        .toString()
        .concat(`${currencySign}`)
    }
  }

  async fetchExchangeRates(selectedFiatCurrency, ticker) {
    return await fetch(
      `${apiURL}base=${selectedFiatCurrency}&symbols=${ticker}`
    )
      .then(r => r.json())
      .catch(error => console.error(error))
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
