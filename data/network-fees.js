const { UserInputError } = require('apollo-server')

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

const TERRA_TAX_RATE = 0.007
const TERRA_TAX_CAP = 1000000

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
  return networkGasPricesDictionary[networkId]
}

const getNetworkTransactionChainAppliedFees = (networkId, transactionType) => {
  if (networkId.startsWith('terra') && transactionType === 'SendTx') {
    return {
      rate: TERRA_TAX_RATE,
      cap: TERRA_TAX_CAP
    }
  } else {
    return {
      rate: 0,
      cap: 0
    }
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

const emoneyGasPrices = [
  {
    denom: 'echf',
    price: '0.530'
  },
  {
    denom: 'eeur',
    price: '0.500'
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
    price: '5.500'
  },
  {
    denom: 'enok',
    price: '6.100'
  },
  {
    denom: 'edkk',
    price: '3.700'
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
    denom: 'stake',
    price: '0.01'
  },
  {
    denom: 'akash',
    price: '0.01'
  }
]

const polkadotGasPrices = []

const networkGasPricesDictionary = {
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

module.exports = { getNetworkTransactionGasEstimates, getNetworkTransactionChainAppliedFees, getNetworkGasPrices }
