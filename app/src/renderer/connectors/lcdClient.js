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
      let data = resError.response.data
      // server responded with error message, create an Error from that
      let error = Error(data.error)
      error.code = data.code
      throw error
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

  // staking
  updateDelegations: req("POST", "/stake/delegations"),
  candidates: req("GET", "/stake/validators"),
  queryDelegation: (delegator, validator) => {
    return req("GET", `/stake/${delegator}/bonding_status/${validator}`)()
  }
})

module.exports = Client
