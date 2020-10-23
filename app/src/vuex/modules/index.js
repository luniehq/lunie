"use strict"

export default (opts) => ({
  connection: require(`./connection.js`).default(opts),
  notifications: require(`./notifications.js`).default(opts),
  session: require(`./session.js`).default(opts),
  account: require(`./account.js`).default(opts),
  keystore: require(`./keystore.js`).default(opts),
  extension: require(`./extension.js`).default(opts),
  signup: require(`./signup.js`).default(opts),
  recover: require(`./recover.js`).default(opts),
})
