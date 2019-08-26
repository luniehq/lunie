import BN from "bignumber.js"
import { calculateTokens } from "scripts/common"
import {
  addTransactionTypeData,
  compareBlockTimeDesc,
  flattenTransactionMsgs
} from "scripts/transaction-utils"

// wallet
export const allTransactions = state =>
  state.transactions.bank.concat(
    state.transactions.staking,
    state.transactions.governance,
    state.transactions.distribution
  )

export const flatOrderedTransactionList = (state, getters) => {
  let allTx = getters.allTransactions.reduce(flattenTransactionMsgs, [])
  allTx = allTx.map(addTransactionTypeData(state))
  allTx.sort(compareBlockTimeDesc)
  return allTx
}

export const validators = state => {
  const names = {}
  state.delegates.delegates.forEach(item => {
    names[item.operator_address] = item
  })
  return names
}

// fee distribution
export const yourValidators = (state, getters) =>
  state.session.signedIn
    ? state.delegates.delegates.filter(
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
export const totalAtoms = (state, getters) => {
  return new BN(getters.liquidAtoms)
    .plus(getters.oldBondedAtoms)
    .plus(getters.oldUnbondingAtoms)
    .toString()
}
export const oldBondedAtoms = state => {
  let totalOldBondedAtoms = new BN(0)
  Object.keys(state.delegation.committedDelegates).forEach(delegatorAddress => {
    const shares = state.delegation.committedDelegates[delegatorAddress]
    const delegator = state.delegates.delegates.find(
      d => d.operator_address === delegatorAddress
    )
    if (!delegator) {
      return
    }
    totalOldBondedAtoms = totalOldBondedAtoms.plus(
      calculateTokens(delegator, shares)
    )
  })
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
export const bondDenom = state =>
  (state.stakingParameters.parameters &&
    state.stakingParameters.parameters.bond_denom) ||
  `uatom`

// governance
export const depositDenom = state =>
  state.governanceParameters.loaded &&
  state.governanceParameters.parameters.deposit.min_deposit
    ? state.governanceParameters.parameters.deposit.min_deposit[0].denom
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
