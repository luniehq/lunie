// connection
export const connected = state => state.connection.connected
export const nodeUrl = state =>
  state.connection.connected ? state.connection.nodeUrl : undefined

export const address = state => state.session.address
export const network = state => state.connection.network
export const selectedNetworkTitle = state => state.connection.networkTitle

export const isExtensionAccount = state =>
  state.extension.accounts.some(account => {
    return account.address === state.session.address
  })
