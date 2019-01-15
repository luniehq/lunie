"use strict"

const getUnbondingTime = ({ height, tx }, unbondingDelegations) => {
  const { type, value } = tx.value.msg[0]
  if (type === `cosmos-sdk/BeginUnbonding`) {
    const unbondingDelegation = unbondingDelegations[value.validator_addr]
    if (
      unbondingDelegation &&
      unbondingDelegation.creation_height === String(height)
    ) {
      return new Date(unbondingDelegation.min_time).getTime()
    }
  }
  return NaN
}
module.exports = {
  getUnbondingTime
}
