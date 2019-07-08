"use strict"

export const getUnbondingTime = ({ height, tx }, unbondingDelegations) => {
  const { type, value } = tx.value && tx.value.msg && tx.value.msg[0]
  if (type === `cosmos-sdk/MsgUndelegate`) {
    const validatorUnbondingDelegation =
      unbondingDelegations[value.validator_address]
    const unbondingDelegation =
      validatorUnbondingDelegation &&
      validatorUnbondingDelegation.find(
        ({ creation_height }) => creation_height === String(height)
      )
    if (unbondingDelegation) {
      return new Date(unbondingDelegation.completion_time).getTime()
    }
  }
  return NaN
}

// Modified function to support new transaction type
export const getUnbondTimeFromTX = (tx, unbondingDelegations) => {
  const { type, blockNumber, value } = tx
  if (type === `cosmos-sdk/MsgUndelegate`) {
    const validatorUnbondingDelegation =
      unbondingDelegations[value.validator_address]
    const unbondingDelegation =
      validatorUnbondingDelegation &&
      validatorUnbondingDelegation.find(
        ({ creation_height }) => creation_height === String(blockNumber)
      )
    if (unbondingDelegation) {
      return new Date(unbondingDelegation.completion_time).getTime()
    }
  }
  return NaN
}
