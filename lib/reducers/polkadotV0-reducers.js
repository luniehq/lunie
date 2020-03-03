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
    commission: validator.validatorPrefs.commission / 100000000,
    maxCommission: undefined,
    maxChangeCommission: undefined,
    status: `ACTIVE`, // We are fetching current session active validators only (not intentions)
    statusDetailed: ``, // TODO: Include validator heartbeat messages
    delegatorShares: undefined
  }
}

module.exports = {
  blockReducer,
  validatorReducer
}
