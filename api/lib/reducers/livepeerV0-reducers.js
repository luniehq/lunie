const BigNumber = require('bignumber.js')
const LPT_CONVERSION = `1000000000000000000`

function blockReducer(networkId, block, data = {}) {
  return {
    networkId,
    height: block.id,
    chainId: networkId,
    hash: block.id,
    time: block.timestamp,
    data: JSON.stringify(data)
  }
}

function validatorCommissionReducer(commission) {
  // precision of commision is 1:1000000
  return BigNumber(commission).div('1000000')
}

function validatorStatusEnumReducer(active) {
  return active ? 'ACTIVE' : 'INACTIVE'
}

function bigNumberReducer(bignumber) {
  return bignumber ? BigNumber(bignumber).div(LPT_CONVERSION) : null
}

function formatBech32Reducer(address) {
  if (address.startsWith(`0x`)) {
    return address.slice(0, 6) + `…` + address.slice(-1 * 4)
  }
}

function votingPowerReducer(validator, totalStakedTokens) {
  return BigNumber(bigNumberReducer(validator.totalStake)).div(
    totalStakedTokens
  )
}

function livepeerExpectedRewardsReducer({
  rewardCut,
  inflation,
  inflationChange,
  totalSupply,
  totalStaked
}) {
  return expectedRewardsPerToken({
    rewardCut: validatorCommissionReducer(rewardCut).toNumber(),
    inflation: validatorCommissionReducer(inflation).toNumber(),
    inflationChange: validatorCommissionReducer(inflationChange).toNumber(),
    totalSupply: bigNumberReducer(totalSupply).toNumber(),
    totalStaked: bigNumberReducer(totalStaked).toNumber()
  })
}

// extracted from the livepeer explorer
function expectedRewardsPerToken({
  rewardCut,
  inflation,
  inflationChange,
  totalSupply,
  totalStaked
}) {
  const principle = 1

  let hoursPerYear = 8760
  let averageHoursPerRound = 21
  let roundsPerYear = hoursPerYear / averageHoursPerRound

  let totalRewardTokens = 0
  let roi = 0
  let percentOfTotalStaked = principle / totalStaked
  let participationRate = totalStaked / totalSupply
  let totalRewardTokensMinusFee
  let currentMintableTokens

  for (let i = 0; i < roundsPerYear; i++) {
    if (inflation < 0) break
    currentMintableTokens = totalSupply * inflation
    totalRewardTokens = percentOfTotalStaked * currentMintableTokens
    totalRewardTokensMinusFee =
      totalRewardTokens - totalRewardTokens * rewardCut
    roi = roi + totalRewardTokensMinusFee
    totalSupply = totalSupply + currentMintableTokens
    inflation =
      participationRate > 0.5
        ? inflation - inflationChange
        : inflation + inflationChange
  }
  return roi
}

function validatorReducer(networkId, validator, totalStakedTokens, globals) {
  return {
    networkId,
    operatorAddress: validator.id,
    tokens: bigNumberReducer(validator.totalStake),
    commission: validatorCommissionReducer(validator.rewardCut),
    status: validatorStatusEnumReducer(validator.active), // this field is going to disappear the next 9th of January. I'm looking into transitioning
    statusDetailed: validator.status, // Registered/Unregistered,
    rewardCut: validator.rewardCut,
    votingPower: votingPowerReducer(validator, totalStakedTokens),
    globals
  }
}

module.exports = {
  validatorReducer,
  blockReducer,
  formatBech32Reducer,
  livepeerExpectedRewardsReducer,
  LPT_CONVERSION
}
