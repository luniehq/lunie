export const mainCounter = state => state.counters.main
export const allWallets = state => state.wallets.wallets
export const allTransactions = state => state.transactions
export const allAddresses = state => state.addresses
export const notifications = state => state.notifications
export const logOutput = state => state.log.output

export const syncHeight = state => state.node.syncHeight
export const syncTime = state => state.node.syncTime
export const syncing = state => state.node.syncing
export const numPeers = state => state.node.numPeers

export const candidates = state => state.candidates
export const shoppingCart = state => state.shoppingCart
export const user = state => state.user
export const config = state => state.config
