const terraV3Reducers = require('./terraV3-reducers')
const BigNumber = require('bignumber.js')

function expectedRewardsPerToken(
  validator,
  commission,
  inflation,
  totalBackedValue
) {
  const percentTotalStakedNGM = BigNumber(validator.votingPower).times(1000)
  const totalNGMStakedToValidator = validator.tokens
  const division = BigNumber(percentTotalStakedNGM)
    .times(BigNumber(1).minus(commission))
    .div(BigNumber(totalNGMStakedToValidator))
  // First we calculate the total value of rewards we get for staking one single
  // NGM in this particular validator
  const delegatorSharePerToken = BigNumber(inflation * totalBackedValue).div(
    division
  )
  return delegatorSharePerToken.div(1000000)
  // TODO
  // Now we convert delegatorRewardsPerToken to the amount of NGM we can buy now
  // with this reward
}

module.exports = {
  ...terraV3Reducers,
  expectedRewardsPerToken
}
