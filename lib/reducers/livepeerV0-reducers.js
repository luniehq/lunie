const BigNumber = require('bignumber.js')

function blockReducer(networkId, block) {
  return {
    networkId,
    height: block.id,
    chainId: networkId,
    hash: block.id,
    time: block.timestamp
  }
}

function validatorCommissionReducer(commission) {
  return commission
    ? BigNumber(commission)
        .div('1000000')
        .toString()
    : null
}

function validatorStatusEnumReducer(active) {
  return active ? 'ACTIVE' : 'INACTIVE'
}

function bigNumberReducer(bignumber) {
  return bignumber
    ? BigNumber(bignumber)
        .div('1000000000000000000')
        .toString()
    : null
}

function formatBech32Reducer(address) {
  if (address.startsWith(`0x`)) {
    return address.slice(0, 6) + `…` + address.slice(-1 * 4)
  }
}

function totalStakeReducer(validator) {
  return BigNumber(validator.totalStake)
    .plus(BigNumber(validator.totalDelegatorsStake))
    .div('1000000000000000000')
    .toString()
}

function votingPowerReducer(validator, totalStakedTokens) {
  const totalValidatorStake = BigNumber(validator.totalStake).plus(
    BigNumber(validator.totalDelegatorsStake)
  )
  return totalValidatorStake
    .div('10000000000000000')
    .div(totalStakedTokens)
    .toString()
}

function validatorReducer(networkId, validator, totalStakedTokens) {
  return {
    networkId,
    operatorAddress: validator.id,
    tokens: totalStakeReducer(validator),
    selfStake: bigNumberReducer(validator.totalStake),
    commission: validatorCommissionReducer(validator.rewardCut),
    status: validatorStatusEnumReducer(validator.active),
    statusDetailed: validator.status, // Registered/Unregistered
    votingPower: votingPowerReducer(validator, totalStakedTokens),
    expectedReturns: validatorCommissionReducer(validator.feeShare) // This percentage means how much from the reward the delegator is going to get (each round I presume)
  }
}

module.exports = {
  validatorReducer,
  blockReducer,
  formatBech32Reducer
}
