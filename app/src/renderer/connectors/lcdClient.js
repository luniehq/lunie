"use strict"

const axios = require("axios")

// returns an async function which makes a request for the given
// HTTP method (GET/POST/DELETE/etc) and path (/foo/bar)
function req(method, path) {
  return async function(data) {
    return await this.request(method, path, data)
  }
}

// returns an async function which makes a request for the given
// HTTP method and path, which accepts arguments to be appended
// to the path (/foo/{arg}/...)
function argReq(method, prefix, suffix = "") {
  return function(args, data) {
    // `args` can either be a single value or an array
    if (Array.isArray(args)) {
      args = args.join("/")
    }
    if (method === "DELETE") {
      data = { data }
    }
    return this.request(method, `${prefix}/${args}${suffix}`, data)
  }
}

class Client {
  constructor(server = "http://localhost:8998") {
    this.server = server
  }

  async request(method, path, data) {
    try {
      let res = await axios[method.toLowerCase()](this.server + path, data)
      return res.data
    } catch (resError) {
      if (!resError.response || !resError.response.data) {
        throw resError
      }
      // server responded with error message, create an Error from that
      throw Error(resError.response.data)
    }
  }
}

let fetchAccount = argReq("GET", "/accounts")

Object.assign(Client.prototype, {
  // meta
  lcdConnected: function() {
    return this.listKeys().then(() => true, () => false)
  },

  // tx
  sign: req("POST", "/sign"),
  postTx: req("POST", "/tx"),

  // keys
  generateSeed: req("GET", "/keys/seed"),
  listKeys: req("GET", "/keys"),
  storeKey: req("POST", "/keys"),
  getKey: argReq("GET", "/keys"),
  updateKey: argReq("PUT", "/keys"),
  // axios handles DELETE requests different then other requests, we have to but the body in a config object with the prop data
  deleteKey: argReq("DELETE", "/keys"),

  // coins
  send: argReq("POST", "/accounts", "/send"),
  ibcSend: argReq("POST", "/ibc", "/send"),
  queryAccount(address) {
    return fetchAccount
      .call(this, address)
      .then(res => {
        return res.value
      })
      .catch(err => {
        console.log("err")
        // if account not found, return null instead of throwing
        if (err.message.includes("account bytes are empty")) {
          return null
        }
        throw err
      })
  },
  txs: function(addr) {
    return Promise.all([
      req("GET", `/txs?tag=sender_bech32='${addr}'`).call(this),
      req("GET", `/txs?tag=recipient_bech32='${addr}'`).call(this)
    ]).then(([senderTxs, recipientTxs]) => [].concat(senderTxs, recipientTxs))
  },

  tx: argReq("GET", "/txs"),

  // staking
  candidate: argReq("GET", "/query/stake/candidate"),
  candidates: req("GET", "/query/stake/candidates"),
  buildDelegate: req("POST", "/build/stake/delegate"),
  buildUnbond: req("POST", "/build/stake/unbond"),
  bondingsByDelegator: argReq("GET", "/query/stake/delegator")
})

module.exports = Client
