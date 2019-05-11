import BN from "bignumber.js"
import { calculateTokens } from "scripts/common"

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

// wallet
export const transactions = state => state.transactions
export const allTransactions = state =>
  state.transactions.bank.concat(
    state.transactions.staking,
    state.transactions.governance,
    state.transactions.distribution
  )
export const ledger = state => state.ledger
export const wallet = state => state.wallet

// fee distribution
export const distribution = state => state.distribution
export const yourValidators = (state, getters) =>
  state.session.signedIn
    ? getters.delegates.delegates.filter(
        ({ operator_address }) =>
          operator_address in getters.committedDelegations
      )
    : []

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
export const shoppingCart = state => state.delegation.delegates
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
export const approvalRequired = state => state.connection.approvalRequired
export const connected = state => state.connection.connected
export const lastHeader = state => state.connection.lastHeader
export const nodeUrl = state =>
  state.connection.connected ? state.connection.nodeUrl : undefined

export const blocks = state => (state.blocks ? state.blocks.blocks : [])
export const block = state => (state.blocks ? state.blocks.block : [])
