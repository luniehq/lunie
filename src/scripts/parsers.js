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

export const parseFee = signMessage => {
  const { fee } = JSON.parse(signMessage)
  return Number(fee.amount[0].amount)
}

export const parseValueObj = signMessage => {
  const { msgs } = JSON.parse(signMessage)
  if (msgs[0].type === "cosmos-sdk/MsgSend") {
    return Number(msgs[0].value.amount[0])
  } else {
    return Number(msgs[0].value.amount)
  }
}
