// ui
export const config = state => state.config
export const filters = state => state.filters
export const notifications = state => state.notifications
export const user = state => state.user
export const themes = state => state.themes
export const onboarding = state => state.onboarding

// wallet
export const transactions = state => state.wallet.history
export const wallet = state => state.wallet

// staking
export const committedDelegations = state => state.delegation.committedDelegates
export const delegates = state => state.delegates
export const shoppingCart = state => state.delegation.delegates

// govern
export const proposals = state => state.proposals

// monitor
export const blockchain = state => state.blockchain
export const validators = state => state.validators.validators

// status
export const approvalRequired = state => state.node.approvalRequired
export const connected = state => state.node.connected
export const lastHeader = state => state.node.lastHeader
export const nodeIP = state => state.node.nodeIP
export const mockedConnector = state => state.node.mocked

//blockchain
export const blocTxInfo = state => {
  return (
    state.blockchain.block &&
    state.blockchain.blockTxs.find(
      b => b.length && b[0].height === state.blockchain.block.header.height
    )
  )
}
