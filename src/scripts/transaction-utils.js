"use strict"

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

const makeTxObject = (tx, fees, memo, time, height, hash, msgIndex) => {
  return {
    ...tx,
    // txhash alone doesn't work as we split into multiple messages which would all have the same hash
    key: `${hash}_${msgIndex}`,
    blockNumber: Number(height),
    time: new Date(time),
    group: transactionGroup[tx.type],
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
  const newVals = curTxList.tx.value.msg.map((x, index) =>
    makeTxObject(
      x,
      fees,
      memo,
      curTxList.timestamp,
      curTxList.height,
      curTxList.txhash,
      index
    )
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
