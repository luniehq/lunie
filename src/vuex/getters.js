// connection
export const connected = state => state.connection.connected
export const nodeUrl = state =>
  state.connection.connected ? state.connection.nodeUrl : undefined

export const address = state => state.session.address
export const network = state => state.connection.network
export const networkSlug = state => state.connection.networkSlug
export const addressType = state => state.connection.addressType

export const isExtensionAccount = state =>
  state.extension.accounts.some(account => {
    return account.address === state.session.address
  })
