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

  /* ============ STAKE ============ */

  // Get all delegations information from a delegator
  getDelegator: function(addr) {
    return req("GET", `/stake/delegators/${addr}`).call(this)
  },
  // Get all txs from a delegator
  getDelegatorTxs: function(addr, types) {
    if (!types) {
      return req("GET", `/stake/delegators/${addr}/txs`).call(this)
    } else {
      return req("GET", `/stake/delegators/${addr}/txs?type=${types}`).call(
        this
      )
    }
  },
  // // Query all validators that a delegator is bonded to
  // getDelegatorValidators: function(delegatorAddr) {
  //   return req("GET", `/stake/delegators/${delegatorAddr}/validators`).call(this)
  // },
  // // Query a validator info that a delegator is bonded to
  // getDelegatorValidator: function(delegatorAddr, validatorAddr) {
  //   return req("GET", `/stake/delegators/${delegatorAddr}/validators/${validatorAddr}`).call(this)
  // },

  // Get a list containing all the validator candidates
  getCandidates: req("GET", "/stake/validators"),
  // Get information from a validator
  getCandidate: function(addr) {
    return req("GET", `/stake/validators/${addr}`).call(this)
  },
  // // Get all of the validator bonded delegators
  // getValidatorDelegators: function(addr) {
  //   return req("GET", `/stake/validator/${addr}/delegators`).call(this)
  // },

  // Get the list of the validators in the latest validator set
  getValidatorSet: req("GET", "/validatorsets/latest"),

  updateDelegations: function(delegatorAddr, data) {
    return req("POST", `/stake/delegators/${delegatorAddr}/delegations`).call(
      this,
      data
    )
  },

  // Query a delegation between a delegator and a validator
  queryDelegation: function(delegatorAddr, validatorAddr) {
    return req(
      "GET",
      `/stake/delegators/${delegatorAddr}/delegations/${validatorAddr}`
    ).call(this)
  },
  queryUnbonding: function(delegatorAddr, validatorAddr) {
    return req(
      "GET",
      `/stake/delegators/${delegatorAddr}/unbonding_delegations/${validatorAddr}`
    ).call(this)
  }
})

module.exports = Client
