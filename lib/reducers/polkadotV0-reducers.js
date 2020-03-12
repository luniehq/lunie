const BigNumber = require('bignumber.js')

function blockReducer(
  networkId,
  blockHeight,
  blockHash,
  sessionIndex,
  blockAuthor,
  blockEvents
) {
  return {
    networkId,
    height: blockHeight,
    chainId: `kusama-cc3`,
    hash: blockHash,
    sessionIndex,
    time: new Date().toISOString(), // TODO: Get from blockchain state
    transactions: blockEvents, // TODO: IMPROVE!
    proposer_address: blockAuthor
  }
}

function validatorReducer(network, validator) {
  return {
    networkId: network.id,
    chainId: network.chain_id,
    operatorAddress: validator.accountId,
    website:
      validator.identity.web && validator.identity.web !== ``
        ? validator.identity.web
        : ``,
    identity:
      validator.identity.display && validator.identity.display !== ``
        ? validator.identity.display
        : validator.accountId,
    name:
      validator.identity.display && validator.identity.display !== ``
        ? validator.identity.display
        : validator.accountId,
    votingPower: validator.votingPower.toFixed(9),
    startHeight: undefined,
    uptimePercentage: undefined,
    tokens: validator.tokens,
    commissionUpdateTime: undefined,
    commission: (validator.validatorPrefs.commission / 1000000000).toFixed(9), // Returns commission in 0-1 range (1 = 100%)
    maxCommission: undefined,
    maxChangeCommission: undefined,
    status: `ACTIVE`, // We are fetching current session active validators only (not intentions)
    statusDetailed: ``, // TODO: Include validator heartbeat messages
    delegatorShares: undefined,
    selfStake:
      (
        BigNumber(validator.exposure.own).toNumber() *
        network.coinLookup[0].chainToViewConversionFactor
      ).toFixed(9) || 0,
    nominations: validator.nominations
  }
}

function balanceReducer(network, balance) {
  // hack. We convert the balance into an Array to make it an Iterable
  return [
    {
      amount: BigNumber(balance)
        .times(network.coinLookup[0].chainToViewConversionFactor)
        .toFixed(4),
      denom: network.coinLookup[0].viewDenom
    }
  ]
}

function delegationReducer(network, delegation, validator) {
  return {
    validatorAddress: validator.operatorAddress,
    delegatorAddress: delegation.who,
    validator,
    amount: BigNumber(delegation.value)
      .times(network.coinLookup[0].chainToViewConversionFactor)
      .toFixed(9)
  }
}

module.exports = {
  blockReducer,
  validatorReducer,
  balanceReducer,
  delegationReducer
}
