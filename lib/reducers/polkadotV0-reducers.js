const BigNumber = require('bignumber.js')

const POLKADOT_CONVERSION = 1000000000000

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
    commission: validator.validatorPrefs.commission / 10000000,
    maxCommission: undefined,
    maxChangeCommission: undefined,
    status: `ACTIVE`, // We are fetching current session active validators only (not intentions)
    statusDetailed: ``, // TODO: Include validator heartbeat messages
    delegatorShares: undefined,
    selfStake:
      (
        BigNumber(validator.exposure.own).toNumber() / POLKADOT_CONVERSION
      ).toFixed(9) || 0,
    nominations: validator.nominations
  }
}

function balanceReducer(balance) {
  // hack. We convert the balance into an Array to make it an Iterable
  return [
    {
      amount: BigNumber(balance)
        .div(POLKADOT_CONVERSION)
        .toFixed(4),
      denom: `KSM` // hardcoded for now. Looking how to do a more complete query
    }
  ]
}

function delegationReducer(delegation, validator) {
  return {
    validatorAddress: validator.operatorAddress,
    delegatorAddress: delegation.who,
    validator,
    amount: BigNumber(delegation.value)
      .dividedBy(10 ** 12) // FIXME: Replace by constant
      .toFixed(9)
  }
}

module.exports = {
  blockReducer,
  validatorReducer,
  balanceReducer,
  delegationReducer
}
