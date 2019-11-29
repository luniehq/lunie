"use strict"

export default opts => ({
  connection: require(`./connection.js`).default(opts),
  notifications: require(`./notifications.js`).default(opts),
  session: require(`./session.js`).default(opts),
  keystore: require(`./keystore.js`).default(opts),
  ledger: require(`./ledger.js`).default(opts),
  extension: require(`./extension.js`).default(opts),
  signup: require(`./signup.js`).default(opts),
  recover: require(`./recover.js`).default(opts),
  pushNotifications: require(`./push-notifications`).default(opts)
})
