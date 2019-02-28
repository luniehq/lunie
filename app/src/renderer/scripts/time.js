"use strict"

const getUnbondingTime = ({ height, tx }, unbondingDelegations) => {
  const { type, value } = tx.value && tx.value.msg && tx.value.msg[0]
  if (type === `cosmos-sdk/Undelegate`) {
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
