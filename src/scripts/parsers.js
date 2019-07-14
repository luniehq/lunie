'use strict'

export const parseTx = signMessage => {
  const { msgs, fee, memo } = JSON.parse(signMessage)

  return {
    tx: {
      type: 'auth/StdTx',
      value: {
        msg: msgs,
        fee,
        memo
      }
    }
  }
}

export const parseFee = stdTx => {
  const {
    value: { fee }
  } = stdTx
  return Number(fee.amount[0].amount)
}

export const parseValueObj = stdTx => {
  const {
    value: { msg }
  } = stdTx
  if (msg[0].type === 'cosmos-sdk/MsgSend') {
    return msg[0].value.amount[0]
  } else {
    return msg[0].value.amount
  }
}
