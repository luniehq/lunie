export default (opts) => ({
  delegates: require('./delegates.js').default(opts),
  config: require('./config.js').default(opts),
  filters: require('./filters.js').default(opts),
  node: require('./node.js').default(opts),
  notifications: require('./notifications.js').default(opts),
  proposals: require('./proposals.js').default(opts),
  shoppingCart: require('./shoppingCart.js').default(opts),
  user: require('./user.js').default(opts),
  validators: require('./validators.js').default(opts),
  wallet: require('./wallet.js').default(opts),
  delegation: require('./delegation.js').default(opts)
})
