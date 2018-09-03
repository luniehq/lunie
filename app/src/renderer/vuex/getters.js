// ui
export const config = state => state.config
export const bondingDenom = state =>
  state.config.bondingDenom.charAt(0).toUpperCase() +
  state.config.bondingDenom.slice(1)

export const filters = state => state.filters
export const notifications = state => state.notifications
export const user = state => state.user
export const lastPage = state => {
  return (
    state.user.history.length &&
    state.user.history[state.user.history.length - 1]
  )
}
export const themes = state => state.themes
export const onboarding = state => state.onboarding

// wallet
export const allTransactions = state =>
  state.transactions.wallet.concat(state.transactions.staking)
export const wallet = state => state.wallet

// staking
export const delegation = state => state.delegation
export const committedDelegations = state => state.delegation.committedDelegates
export const delegates = state => state.delegates
export const shoppingCart = state => state.delegation.delegates
export const validators = state => state.validators.validators

// govern
export const proposals = state => state.proposals

// status
export const approvalRequired = state => state.node.approvalRequired
export const connected = state => state.node.connected
export const lastHeader = state => state.node.lastHeader
export const nodeIP = state => state.node.nodeIP
export const mockedConnector = state => state.node.mocked
