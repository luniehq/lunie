"use strict"

export default opts => ({
  blocks: require(`./blocks.js`).default(opts),
  transactions: require(`./transactions.js`).default(opts),
  distribution: require(`./distribution.js`).default(opts),
  delegates: require(`./delegates.js`).default(opts),
  delegation: require(`./delegation.js`).default(opts),
  connection: require(`./connection.js`).default(opts),
  notifications: require(`./notifications.js`).default(opts),
  send: require(`./send.js`).default(opts),
  session: require(`./session.js`).default(opts),
  keystore: require(`./keystore.js`).default(opts),
  ledger: require(`./ledger.js`).default(opts),
  wallet: require(`./wallet.js`).default(opts),
  stakingParameters: require(`./parameters.js`).default(opts),
  pool: require(`./pool.js`).default(opts),
  extension: require(`./extension.js`).default(opts),
  minting: require(`./minting.js`).default(opts)
})
