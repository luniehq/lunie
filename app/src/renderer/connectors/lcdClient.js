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
      const response = await axios({
        method: method.toLowerCase(),
        url: this.server + path,
        data,
        headers: { Accept: `application/json` }
      })

      return response.data
    } catch (resError) {
      if (!resError.response || !resError.response.data) {
        throw resError
      }

      // server responded with error message, create an Error from that
      throw Error(JSON.stringify(resError.response.data))
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
  updateDelegations: req("POST", "/stake/delegations"),
  candidates: req("GET", "/stake/validators"),
  getValidators: req("GET", "/validatorsets/latest"),
  queryDelegation: function(delegator, validator) {
    return req("GET", `/stake/${delegator}/delegation/${validator}`).call(this)
  }
})

module.exports = Client
