"use strict"

import crypto from "crypto"

export const getTxHash = txstring => {
  const s256Buffer = crypto
    .createHash(`sha256`)
    .update(Buffer.from(txstring, `base64`))
    .digest()
  const txbytes = new Uint8Array(s256Buffer)
  return Buffer.from(txbytes.slice(0, 20)).toString(`hex`)
}

import { getUnbondTimeFromTX } from "scripts/time"
import {
  messageType,
  transactionGroup
} from "src/components/transactions/messageTypes"

const getFees = (transaction, defaultDenom = "ATOM") => {
  if (transaction.tx.value.fee && transaction.tx.value.fee.amount) {
    return transaction.tx.value.fee.amount[0]
  }
  return {
    amount: "0",
    denom: defaultDenom
  }
}

const makeTxObject = (x, fees, memo, time, height) => {
  return {
    ...x,
    key: `${x.type}_${time}_${JSON.stringify(x.value)}`,
    blockNumber: Number(height),
    time: new Date(time),
    group: transactionGroup[x.type],
    memo,
    fees
  }
}

export const addTransactionTypeData = state => tx => {
  return {
    ...tx,
    group: transactionGroup[tx.type],
    liquidDate: getUnbondTimeFromTX(tx, state.delegation.unbondingDelegations)
  }
}

export function compareBlockTimeDesc(a, b) {
  if (b.blockNumber === a.blockNumber) {
    return b.time - a.time
  }
  return b.blockNumber - a.blockNumber
}

export const flattenTransactionMsgs = (acc, curTxList) => {
  const fees = getFees(curTxList)
  const memo = curTxList.tx.value.memo
  const newVals = curTxList.tx.value.msg.map(x =>
    makeTxObject(x, fees, memo, curTxList.time, curTxList.height)
  )
  return acc.concat(newVals)
}

export const isPendingUndelegation = tx =>
  !isNaN(tx.liquidDate) && tx.type === messageType.UNDELEGATE

export const getCoin = transaction => {
  if (Array.isArray(transaction.value.amount)) {
    return transaction.value.amount[0]
  } else {
    return transaction.value.amount
  }
}
