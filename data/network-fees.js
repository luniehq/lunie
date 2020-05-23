const { UserInputError } = require('apollo-server')
const fetch = require('node-fetch')
const Sentry = require('@sentry/node')
const BigNumber = require('bignumber.js')

const transactionTypesSet = new Set([
  'SendTx',
  'StakeTx',
  'UnstakeTx',
  'RestakeTx',
  'ClaimRewardsTx',
  'SubmitProposalTx',
  'VoteTx',
  'DepositTx',
  'UnknownTx'
])

const FEES_POLLING_INTERVAL = 3600000 // 1h
const TERRA_TAX_CAP = 1000000
const TERRA_TAX_RATE_ENDPOINT = `https://lcd.terra.dev/treasury/tax_rate`
// TODO: add also endpoint for new testnet when it is released
const EMONEY_GAS_PRICES_ENDPOINT = `http://emoney.validator.network/light/authority/gasprices`

let terraTaxRate
let emoneyGasPrices

const pollForNewFees = async () => {
  const terraTaxRateResponse = await fetch(TERRA_TAX_RATE_ENDPOINT)
  .then((r) => r.json())
  .catch((err) => {
    Sentry.withScope(function (scope) {
      scope.setExtra('terra tax rate endpoint', TERRA_TAX_RATE_ENDPOINT)
      Sentry.captureException(err)
    })
  })
  const emoneyGasPricesResponse = await fetch(EMONEY_GAS_PRICES_ENDPOINT)
  .then((r) => r.json())
  .catch((err) => {
    Sentry.withScope(function (scope) {
      scope.setExtra('emoney gas prices endpoint', EMONEY_GAS_PRICES_ENDPOINT)
      Sentry.captureException(err)
    })
  })
  terraTaxRate = Number(Number(terraTaxRateResponse.result).toFixed(6))
  emoneyGasPrices = emoneyGasPricesResponse.result.min_gas_prices.map(gasPrice => gasPrice = {denom: gasPrice.denom, price: gasPrice.amount})
  setTimeout(async () => {
    pollForNewFees()
  }, FEES_POLLING_INTERVAL)
}

// run on API launch
pollForNewFees()

const getNetworkTransactionGasEstimates = (networkId, transactionType) => {
  if (transactionType && !transactionTypesSet.has(transactionType)) {
    throw new UserInputError(
      `Unrecognized transaction type. Valid transaction types are ${Array.from(
        transactionTypesSet.keys()
      ).join(', ')}.`
    )
  }
  const networkGasEstimates = networkGasEstimatesDictionary[networkId]
  if (!networkGasEstimates) {
    throw new UserInputError(
      `Unrecognized network. Currently only ${Object.keys(
        networkGasEstimatesDictionary
      ).join(', ')} are supported`
    )
  }
  return transactionType && networkGasEstimates[`${transactionType}`]
    ? networkGasEstimates[`${transactionType}`]
    : networkGasEstimates.default
}

const getNetworkGasPrices = (networkId) => {
  // update emoneyGasPrices
  networkGasPricesDictionary['emoney-mainnet'] = emoneyGasPrices
  return networkGasPricesDictionary[networkId]
}

const getNetworkTransactionChainAppliedFees = (networkId, transactionType) => {
  if (networkId.startsWith('terra') && transactionType === 'SendTx') {
    return {
      rate: terraTaxRate,
      cap: TERRA_TAX_CAP
    }
  } else {
    return {
      rate: 0,
      cap: 0
    }
  }
}

const getPolkadotMessage = async (messageType, senderAddress, message, network) => {
  const polkadotMessages = require(`../lib/messageCreators/polkadot-transactions`)
  const messageFormatter = polkadotMessages[messageType]
  return messageFormatter && network ? await messageFormatter(senderAddress, message, network) : null
}

const getPolkadotFee = async ({ messageType, message, senderAddress, network }) => {
  if (!messageType) return null

  const chainMessage = await getPolkadotMessage(
    messageType,
    senderAddress,
    message,
    network
  )

  const { partialFee } = await chainMessage.transaction.paymentInfo(
    senderAddress
  )
  const chainFees = partialFee.toJSON()
  const viewFees = BigNumber(chainFees)
    .times(network.coinLookup[0].chainToViewConversionFactor)
    .toNumber()
  const { amount } = message 
  return {
    denom: amount.denom || network.stakingDenom,
    amount: viewFees
  }
}

const terraGasEstimates = {
    default: 300000,
    ClaimRewardsTx: 550000
}

const cosmosGasEstimates = {
  default: 550000
}

const emoneyGasEstimates = {
  default: 300000,
  SendTx: 75000,
  StakeTx: 550000,
  UnstakeTx: 550000,
  ClaimRewardsTx: 550000,
  RestakeTx: 550000
}

const akashGasEstimates = {
  default: 200000
}

const polkadotGasEstimates = {
  default: 0
}

const kavaGasEstimates = {
  default: 550000
}

const networkGasEstimatesDictionary = {
  'cosmos-hub-mainnet': cosmosGasEstimates,
  'cosmos-hub-testnet': cosmosGasEstimates,
  'terra-mainnet': terraGasEstimates,
  'terra-testnet': terraGasEstimates,
  'emoney-mainnet': emoneyGasEstimates,
  'emoney-testnet': emoneyGasEstimates,
  'akash-testnet': akashGasEstimates,
  'kusama': polkadotGasEstimates,
  'kava-mainnet': kavaGasEstimates,
  'kava-testnet': kavaGasEstimates
}

const cosmosGasPrices = [
  {
    denom: 'uatom',
    price: '0.65e-2'
  },
  {
    denom: 'umuon',
    price: '0.65e-2'
  }
]

const terraGasPrices = [
  {
    denom: 'ukrw',
    price: '0.01'
  },
  {
    denom: 'uluna',
    price: '0.015'
  },
  {
    denom: 'umnt',
    price: '0.01'
  },
  {
    denom: 'usdr',
    price: '0.01'
  },
  {
    denom: 'uusd',
    price: '0.01'
  }
]

const kavaGasPrices = [
  {
    denom: 'ukava',
    price: '0.1' // TODO: remind Kava team they have gas price set too high
  }
]

const akashGasPrices = [
  {
    denom: 'uakt',
    price: '0.01'
  }
]

const polkadotGasPrices = []

let networkGasPricesDictionary = {
  'cosmos-hub-mainnet': cosmosGasPrices,
  'cosmos-hub-testnet': cosmosGasPrices,
  'terra-mainnet': terraGasPrices,
  'terra-testnet': terraGasPrices,
  'emoney-mainnet': emoneyGasPrices,
  'emoney-testnet': emoneyGasPrices,
  'kava-mainnet': kavaGasPrices,
  'kava-testnet': kavaGasPrices,
  'akash-testnet': akashGasPrices,
  'kusama': polkadotGasPrices,
}

module.exports = { getNetworkTransactionGasEstimates, getNetworkTransactionChainAppliedFees, getNetworkGasPrices, getPolkadotFee, getPolkadotMessage }
