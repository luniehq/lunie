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

const terraGasEstimates = {
    default: 300000,
    ClaimRewardsTx: 550000
}

const cosmosGasEstimates = {
  default: 550000
}

const emoneyGasEstimates = {
  default: 200000,
  ClaimRewardsTx: 550000
}

const akashGasEstimates = {
  default: 200000
}

const polkadotGasEstimates = {
  default: 0
}

const networkGasEstimatesDictionary = {
  'cosmos-hub-mainnet': cosmosGasEstimates,
  'cosmos-hub-testnet': cosmosGasEstimates,
  'terra-mainnet': terraGasEstimates,
  'terra-testnet': terraGasEstimates,
  'emoney-mainnet': emoneyGasEstimates,
  'emoney-testnet': emoneyGasEstimates,
  'akash-testnet': akashGasEstimates,
  'polkadot-testnet': polkadotGasEstimates
}

module.exports = { getNetworkTransactionGasEstimates }
