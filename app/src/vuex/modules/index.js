"use strict"

export default (opts) => ({
  session: require(`./session.js`).default(opts),
  keystore: require(`./keystore.js`).default(opts),
  signup: require(`./signup.js`).default(opts),
  recover: require(`./recover.js`).default(opts),
})
