export const mainCounter = state => state.counters.main
export const notifications = state => state.notifications
export const logOutput = state => state.log.output

export const nodeIP = state => state.node.nodeIP
export const connected = state => state.node.connected
export const lastHeader = state => state.node.lastHeader

export const candidates = state => state.candidates
export const shoppingCart = state => state.shoppingCart.candidates
export const user = state => state.user
export const config = state => state.config

// monitor
export const blockchain = state => state.blockchain
export const validators = state => state.validators.validators

// govern
export const proposals = state => state.proposals

// wallet
export const wallet = state => state.wallet
export const transactions = state => state.wallet.history

// ui
export const filters = state => state.filters

// developer
export const developerMode = state => state.config.developerMode
