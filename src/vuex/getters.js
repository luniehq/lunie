// connection
export const connected = state => state.connection.connected
export const nodeUrl = state =>
  state.connection.connected ? state.connection.nodeUrl : undefined

export const address = state => state.session.address
export const network = state => state.connection.network

export const isExtensionAccount = state => state.extension.accounts.some(account => {
    return account.address === state.session.address
})

// TODO
export const modalContext = state => ({
  url: "", // state.connection.externals.node.url,
  chainId: "", // state.connection.lastHeader.chain_id,
  connected: state.connection.connected,
  localKeyPairName: state.session.localKeyPairName,
  userAddress: state.session.address,
  rewards: "", // state.distribution.rewards,
  totalRewards: "", // getters.totalRewards,
  delegates: "", // state.delegates.delegates,
  bondDenom: "", // getters.bondDenom,
  isExtensionAccount: state.extension.accounts.some(account => {
    return account.address === state.session.address
  })
})
