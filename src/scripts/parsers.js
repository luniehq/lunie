"use strict"

export const parseTx = signMessage => {
  const { msgs, fee, memo } = JSON.parse(signMessage)

  return {
    tx: {
      type: "auth/StdTx",
      value: {
        msg: msgs,
        fee,
        memo
      }
    }
  }
}

export const parseFee = message => {
  const { fee } = JSON.parse(message)
  return Number(fee.amount[0].amount)
}
