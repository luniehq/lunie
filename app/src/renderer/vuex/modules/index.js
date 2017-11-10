export default (opts) => ({
  candidates: require('./candidates.js')(opts),
  config: require('./config.js')(opts),
  delegators: require('./delegators.js')(opts),
  filters: require('./filters.js')(opts),
  node: require('./node.js')(opts),
  notifications: require('./notifications.js')(opts),
  proposals: require('./proposals.js')(opts),
  shoppingCart: require('./shoppingCart.js')(opts),
  user: require('./user.js')(opts),
  validators: require('./validators.js')(opts),
  wallet: require('./wallet.js')(opts)
})
