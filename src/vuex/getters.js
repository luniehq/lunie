import BN from "bignumber.js"
import { calculateTokens } from "scripts/common"
import { getUnbondTimeFromTX, getUnbondingTime } from "scripts/time"
import messageTypes, {
  transactionGroup
} from "src/components/transactions/messageTypes"

// ui
export const filters = state => state.filters
export const notifications = state => state.notifications
export const session = state => state.session
export const lastPage = state => {
  return (
    state.session.history.length &&
    state.session.history[state.session.history.length - 1]
  )
}
export const keystore = state => state.keystore

// wallet
export const transactions = state => state.transactions
export const allTransactions = state =>
  state.transactions.bank.concat(
    state.transactions.staking,
    state.transactions.governance,
    state.transactions.distribution
  )

const getFees = (transaction, defaultDenom = "ATOM") => {
  if (transaction.tx.value.fee && transaction.tx.value.fee.amount) {
    return transaction.tx.value.fee.amount[0]
  }
  return {
    amount: "0",
    denom: defaultDenom
  }
}

function compareBlockTimeDesc(a, b) {
  if (b.blockNumber === a.blockNumber) {
    return b.time - a.time
  }
  return b.blockNumber - a.blockNumber
}

const makeTxObject = (x, fees, memo, time, height) => {
  return {
    ...x,
    key: `${x.type}_${time}_${JSON.stringify(x.value)}`,
    blockNumber: Number(height),
    time: new Date(time),
    memo,
    fees
  }
}

const addTransactionTypeData = state => tx => {
  return {
    ...tx,
    group: transactionGroup[tx.type],
    timeDiff: getUnbondTimeFromTX(tx, state.delegation.unbondingDelegations)
  }
}

const flattenTransactionMsgs = (acc, curTxList) => {
  const fees = getFees(curTxList)
  const memo = curTxList.tx.value.memo
  const newVals = curTxList.tx.value.msg.map(x =>
    makeTxObject(x, fees, memo, curTxList.time, curTxList.height)
  )
  return acc.concat(newVals)
}

export const flatOrderedTransactionList = (state, getters) => {
  let allTx = getters.allTransactions.reduce(flattenTransactionMsgs, [])
  allTx = allTx.map(addTransactionTypeData(state))
  allTx.sort(compareBlockTimeDesc)
  console.log("allTxs sort rev", allTx)
  return allTx
}

export const blockTransactions = state => {
  let blockTx = state.blocks.block.transactions.reduce(
    flattenTransactionMsgs,
    []
  )
  blockTx = blockTx.map(addTransactionTypeData(state))
  console.log("blockTransactions", blockTx)
  return blockTx
}

export const pendingUndelegations = (state, getters) => {
  const allTx = getters.flatOrderedTransactionList
  const pendingTx = allTx.filter(tx => !isNaN(tx.timeDiff))
  console.log(pendingTx)
  return pendingTx
}

// Not currently used, but kept as reference before merging.
export const unbondingTransactions = state => {
  const transactions = state.transactions.staking
  const delegation = state.delegation

  return (
    transactions.staking &&
    transactions.staking
      .filter(transaction => {
        // Checking the type of transaction
        if (transaction.tx.value.msg[0].type !== `cosmos-sdk/MsgUndelegate`)
          return false

        // getting the unbonding time and checking if it has passed already
        const unbondingEndTime = getUnbondingTime(
          transaction,
          delegation.unbondingDelegations
        )

        if (unbondingEndTime && unbondingEndTime >= Date.now()) return true
      })
      .map(transaction => ({
        ...transaction,
        unbondingDelegation:
          delegation.unbondingDelegations[
            transaction.tx.value.msg[0].value.validator_address
          ]
      }))
  )
}

export const validators = state => {
  const names = {}
  state.delegates.delegates.forEach(item => {
    names[item.operator_address] = item
  })
  return names
}

export const ledger = state => state.ledger
export const wallet = state => state.wallet
export const extension = state => state.extension

// fee distribution
export const distribution = state => state.distribution
export const yourValidators = (state, getters) =>
  state.session.signedIn
    ? getters.delegates.delegates.filter(
        ({ operator_address }) =>
          operator_address in getters.committedDelegations
      )
    : []
export const validatorsWithRewards = (state, getters) =>
  Object.entries(state.distribution.rewards).filter(
    ([, rewards]) => rewards[getters.bondDenom] > 0
  )
export const totalRewards = (state, getters) =>
  getters.validatorsWithRewards.reduce(
    (sum, [, rewards]) => sum + rewards[getters.bondDenom],
    0
  )

// staking
export const liquidAtoms = state =>
  (
    state.wallet.balances.find(
      balance => balance.denom === state.stakingParameters.parameters.bond_denom
    ) || { amount: 0 }
  ).amount
export const delegation = state => state.delegation
export const totalAtoms = (state, getters) => {
  return new BN(getters.liquidAtoms)
    .plus(getters.oldBondedAtoms)
    .plus(getters.oldUnbondingAtoms)
    .toString()
}
export const oldBondedAtoms = (state, getters) => {
  let totalOldBondedAtoms = new BN(0)
  Object.keys(getters.delegation.committedDelegates).forEach(
    delegatorAddress => {
      const shares = getters.delegation.committedDelegates[delegatorAddress]
      const delegator = getters.delegates.delegates.find(
        d => d.operator_address === delegatorAddress
      )
      if (!delegator) {
        return
      }
      totalOldBondedAtoms = totalOldBondedAtoms.plus(
        calculateTokens(delegator, shares)
      )
    }
  )
  return totalOldBondedAtoms
}

export const oldUnbondingAtoms = state => {
  return Object.values(state.delegation.unbondingDelegations).reduce(
    // unbondingDelegations can have several active undelegations per validator (key)
    (atoms, entries) => {
      return BN(atoms).plus(
        entries.reduce((sum, { balance }) => sum.plus(balance), BN(0))
      )
    },
    BN(0)
  )
}
export const committedDelegations = state => state.delegation.committedDelegates
export const delegates = state => state.delegates
export const keybase = state => state.keybase.identities
export const pool = state => state.pool
export const stakingParameters = state => state.stakingParameters
export const bondDenom = getters =>
  (getters.stakingParameters.parameters &&
    getters.stakingParameters.parameters.bond_denom) ||
  `uatom`

// governance
export const proposals = state => state.proposals
export const votes = state => state.votes.votes
export const deposits = state => state.deposits.deposits
export const governanceParameters = state => state.governanceParameters
export const depositDenom = getters =>
  getters.governanceParameters.loaded &&
  getters.governanceParameters.parameters.deposit.min_deposit
    ? getters.governanceParameters.parameters.deposit.min_deposit[0].denom
    : `uatom`

// connection
export const connected = state => state.connection.connected
export const lastHeader = state => state.connection.lastHeader
export const nodeUrl = state =>
  state.connection.connected ? state.connection.nodeUrl : undefined

export const blocks = state => (state.blocks ? state.blocks.blocks : [])
export const block = state => (state.blocks ? state.blocks.block : [])

export const modalContext = (state, getters) => ({
  url: state.connection.externals.node.url,
  chainId: state.connection.lastHeader.chain_id,
  connected: state.connection.connected,
  localKeyPairName: state.session.localKeyPairName,
  userAddress: state.session.address,
  rewards: state.distribution.rewards,
  totalRewards: getters.totalRewards,
  delegates: state.delegates.delegates,
  bondDenom: getters.bondDenom
})
