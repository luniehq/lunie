// share of all provisioned block rewards all delegators of this validator get
export const provisionShare = (validator, totalStakedTokens) => {
  const validatorProvisionShare = validator.tokens / totalStakedTokens
  const delegatorProvisionShare =
    validatorProvisionShare * (1 - validator.commission)

  return delegatorProvisionShare
}

// expected rewards if delegator stakes x tokens
export const expectedRewards = (
  validator,
  totalStakedTokens,
  annualProvision,
  delegatedTokens
) => {
  if (validator.status === 0 || validator.jailed === true) {
    return 0
  }
  const delegatorProvisionShare = provisionShare(validator, totalStakedTokens)
  const annualAllDelegatorRewards = delegatorProvisionShare * annualProvision
  const annualDelegatorRewardsShare = delegatedTokens / validator.tokens
  const annualDelegatorRewards =
    annualDelegatorRewardsShare * annualAllDelegatorRewards
  return annualDelegatorRewards
}

// simplified expected rewards with a fixed token amount
export const expectedReturns = (
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
