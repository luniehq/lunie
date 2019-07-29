import { percent } from "../scripts/num.js"

export const percentOrPending = function(value, totalValue, pending) {
  return pending ? `--` : percent(totalValue === 0 ? 0 : value / totalValue)
}

export const formatBech32 = (address, longForm = false, length = 4) => {
  if (!address) {
    return `Address Not Found`
  } else if (address.indexOf(`1`) === -1) {
    return `Not A Valid Bech32 Address`
  } else if (longForm) {
    return address
  } else {
    return address.split(`1`)[0] + `…` + address.slice(-1 * length)
  }
}

// share of all provisioned block rewards all delegators of this validator get
export const provisionShare = (validator, totalStakedTokens) => {
  const validatorProvisionShare = validator.tokens / totalStakedTokens
  const delegatorProvisionShare =
    validatorProvisionShare * (1 - validator.commission.rate)

  return delegatorProvisionShare
}

// expected rewards if delegator stakes x tokens
export const expectedRewards = (
  validator,
  totalStakedTokens,
  annualProvision,
  delegatedTokens
) => {
  const delegatorProvisionShare = provisionShare(validator, totalStakedTokens)
  const annualAllDelegatorRewards = delegatorProvisionShare * annualProvision
  const annualDelegatorRewardsShare = delegatedTokens / validator.tokens
  const annualDelegatorRewards =
    annualDelegatorRewardsShare * annualAllDelegatorRewards
  return annualDelegatorRewards
}

// simplified expected rewards with a fixed token amount
export const extrapolatedReturns = (
  validator,
  totalStakedTokens,
  annualProvision
) => {
  const standardizedTokenamount = 10000000000
  return (
    expectedRewards(
      validator,
      totalStakedTokens,
      annualProvision,
      standardizedTokenamount
    ) / standardizedTokenamount
  )
}
