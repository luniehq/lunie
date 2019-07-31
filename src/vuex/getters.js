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
