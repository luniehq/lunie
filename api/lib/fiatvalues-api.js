const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()
const Sentry = require('@sentry/node')
const fetch = require('node-fetch')
const { keyBy } = require('lodash')
const { calculateTokenExchangeRates } = require('./reducers/emoneyV0-reducers')
const EMoneyV0Reducers = require('./reducers/emoneyV0-reducers')
const { fixDecimalsAndRoundUp } = require('../common/numbers.js')

const allFiatCurrencies = [
  'usd',
  'eur',
  'cad',
  'gbp',
  'jpy',
  'chf',
  'dkk',
  'nok',
  'sek'
]

const allFiatCurrenciesSet = new Set([
  'EUR',
  'USD',
  'CAD',
  'GBP',
  'CHF',
  'JPY',
  'DKK',
  'NOK',
  'SEK'
])

const denomToCoinGeckoIDDictionary = {
  ATOM: 'cosmos',
  LUNA: 'terra-luna',
  KRT: 'terra-krw',
  SDT: 'terra-sdt',
  KAVA: 'kava',
  BNB: 'binancecoin',
  // USDX: 'usdx', // not on coin gecko yet
  KSM: 'kusama',
  DOT: 'polkadot'
}

const geckoIDToDenomDictionary = {
  cosmos: 'ATOM',
  'terra-luna': 'LUNA',
  'terra-krw': 'KRT',
  'terra-sdt': 'SDT',
  kava: 'KAVA',
  binancecoin: 'BNB',
  // usdx: 'USDX', // not on coin gecko yet
  kusama: 'KSM',
  polkadot: 'DOT'
}

const fiatCurrenciesSymbolsDictionary = {
  USD: '$',
  EUR: '€',
  CAD: 'CA$',
  GBP: '£',
  CHF: 'Fr',
  JPY: '¥',
  DKK: 'kr',
  NOK: 'kr',
  SEK: 'kr'
}

const EMoneyFiatExchangeRateApi = process.env.EMONEY_EXCHANGE_API_RATES_ENDPOINT
const EMoneyAPIUrlMainnet = process.env.EMONEY_API_MAINNET
const EMoneyAPIUrlTestnet = process.env.EMONEY_API_TESTNET

class fiatValueAPI {
  constructor() {
    this.client = CoinGeckoClient
    this.pollingInterval = 300000 // every 5 min
    this.fiatValuesAPIDictionary = denomToCoinGeckoIDDictionary
    this.fiatValuesAPIReverseDictionary = geckoIDToDenomDictionary
    this.fiatCurrenciesSymbolsDictionary = fiatCurrenciesSymbolsDictionary
    this.coins = ['ATOM', 'LUNA', 'KRT', 'SDT', 'KAVA', 'BNB', 'KSM', 'DOT'] // Lunie coins currently being traded in the open
    this.priceFeed = {}

    this.pollNewPriceFeed()
  }

  async pollNewPriceFeed() {
    this.priceFeed = await this.getNewPriceFeed()
    await this.updateEMoneyExchangeRates()
    await this.getFiatValuesForAllCoins()

    setTimeout(async () => {
      this.pollNewPriceFeed()
    }, this.pollingInterval)
  }

  async getNewPriceFeed() {
    try {
      const fiatValuesAPIResponse = await this.client.simple.price({
        ids: this.coins
          .map((coinID) => this.fiatValuesAPIDictionary[coinID])
          .join(','),
        vs_currencies: [allFiatCurrencies.join(',')]
      })

      return fiatValuesAPIResponse.data
    } catch (error) {
      console.error(error)
      Sentry.captureException(error)
      return {}
    }
  }

  async getFiatValuesForAllCoins() {
    const geckoCoinIDs = this.coins.map(
      (coinID) => this.fiatValuesAPIDictionary[coinID]
    )
    const fiatCurrenciesUppercase = allFiatCurrencies.map((fiatCurrency) =>
      fiatCurrency.toUpperCase()
    )
    let allFiatValues = {}
    if (Object.keys(this.priceFeed).length > 0) {
      allFiatValues = geckoCoinIDs.reduce((allFiatValues, coinID) => {
        const coinDenom = this.fiatValuesAPIReverseDictionary[coinID] // the actual denom of the coin
        fiatCurrenciesUppercase.forEach((fiatCurrency) => {
          allFiatValues = {
            ...allFiatValues,
            [coinDenom]: {
              ...allFiatValues[coinDenom],
              [fiatCurrency]: this.priceFeed[coinID][fiatCurrency.toLowerCase()]
            }
          }
        })
        return allFiatValues
      }, {})
    }
    // add e-Money exchange rates
    allFiatValues = {
      ...allFiatValues,
      ...this.eMoneyExchangeRates
    }
    this.allFiatValues = allFiatValues
  }

  async calculateFiatValues(coins, fiatCurrency = 'USD') {
    // empty string coming from the FE is not overriden by parameter's default value
    if (!fiatCurrency) fiatCurrency = 'USD'
    // firt check if the fiatCurrency is a supported currency
    if (!allFiatCurrenciesSet.has(fiatCurrency)) {
      throw new Error(
        `We currently only support ${Array.from(allFiatCurrenciesSet).join(
          ', '
        )} as fiat currencies. Remember they should be written in uppercases`
      )
    }
    const fiatValuesArray = await Promise.all(
      coins.map((coin) =>
        this.allFiatValues[coin.denom] &&
        this.allFiatValues[coin.denom][fiatCurrency]
          ? {
              coinDenom: coin.denom, // only used to identify values
              amount: fixDecimalsAndRoundUp(
                Number(coin.amount) *
                  this.allFiatValues[coin.denom][fiatCurrency],
                6
              ),
              denom: fiatCurrency,
              symbol: this.fiatCurrenciesSymbolsDictionary[fiatCurrency]
            }
          : {
              coinDenom: coin.denom, // only used to identify values
              amount: 0,
              denom: fiatCurrency,
              symbol: this.fiatCurrenciesSymbolsDictionary[fiatCurrency]
            }
      )
    )
    return keyBy(fiatValuesArray, 'coinDenom')
  }

  async updateEMoneyExchangeRates() {
    try {
      const [
        fiatExchangeRates,
        tokenExchangeRatesMainnet,
        tokenExchangeRatesTestnet
      ] = await Promise.all([
        this.fetchFiatExchangeRates(),
        this.fetchEmoneyTokenExchangeRates(EMoneyAPIUrlMainnet),
        this.fetchEmoneyTokenExchangeRates(EMoneyAPIUrlTestnet)
      ])
      const eMoneyExchangeRatesMainnet = calculateTokenExchangeRates(
        allFiatCurrenciesSet,
        tokenExchangeRatesMainnet,
        fiatExchangeRates,
        EMoneyV0Reducers
      )
      const eMoneyExchangeRatesTestnet = calculateTokenExchangeRates(
        allFiatCurrenciesSet,
        tokenExchangeRatesTestnet,
        fiatExchangeRates,
        EMoneyV0Reducers
      )
      // now we combine both exchange rates, mainnet and testnet, in one single Object
      // mainnet values override duplicate testnet values
      this.eMoneyExchangeRates = {
        ...eMoneyExchangeRatesTestnet,
        ...eMoneyExchangeRatesMainnet
      }
    } catch (error) {
      console.error('EMoney token rates update failed', error)
      Sentry.captureException(error)
    }
  }

  async fetchEmoneyTokenExchangeRates(url) {
    const rates = await fetch(`${url}rates.json`)
      .then((r) => r.json())
      .catch((err) => {
        Sentry.withScope(function (scope) {
          scope.setExtra('fetch', `${url}rates.json`)
          Sentry.captureException(err)
        })
        return {}
      })
    rates['NGM'] = { EUR: 0.5 }
    return rates
  }

  async fetchFiatExchangeRates() {
    let all = {}
    await Promise.all(
      Array.from(allFiatCurrenciesSet).map(async (fiatCurrency) => {
        const { rates } = await fetch(
          `${EMoneyFiatExchangeRateApi}base=${fiatCurrency}`
        )
          .then((r) => r.json())
          .catch((error) => {
            console.error(error)
            return {}
          })
        all[fiatCurrency] = rates || {}
      })
    )

    return all
  }
}

module.exports = fiatValueAPI
