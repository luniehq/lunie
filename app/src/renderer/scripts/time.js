"use strict"

const getUnbondingTime = ({ height, tx }, unbondingDelegations) => {
  const { type, value } = tx.value && tx.value.msg && tx.value.msg[0]
  if (type === `cosmos-sdk/Undelegate`) {
    const validatorUnbondingDelegation = unbondingDelegations[value.validator_addr]
    const unbondingDelegation = validatorUnbondingDelegation.find(({ creation_height }) => creation_height === String(height))
    if (
      unbondingDelegation
    ) {
      return new Date(unbondingDelegation.min_time).getTime()
    }
  }
  return NaN
}
module.exports = {
  getUnbondingTime
}
