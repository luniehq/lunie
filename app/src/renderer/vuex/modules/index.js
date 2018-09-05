export default opts => ({
  blockchain: require("./blockchain.js").default(opts),
  transactions: require("./transactions.js").default(opts),
  config: require("./config.js").default(opts),
  delegates: require("./delegates.js").default(opts),
  delegation: require("./delegation.js").default(opts),
  filters: require("./filters.js").default(opts),
  node: require("./node.js").default(opts),
  notifications: require("./notifications.js").default(opts),
  onboarding: require("./onboarding.js").default(opts),
  proposals: require("./proposals.js").default(opts),
  send: require("./send.js").default(opts),
  themes: require("./themes.js").default(opts),
  user: require("./user.js").default(opts),
  validators: require("./validators.js").default(opts),
  wallet: require("./wallet.js").default(opts),
  keybase: require("./keybase.js").default(opts)
})
