"use strict"

const axios = require(`axios`)

const Client = (server = `http://localhost:8998`) => {
  async function request(method, path, data) {
    try {
      let res = await axios[method.toLowerCase()](server + path, data)
      return res.data
    } catch (resError) {
      if (!resError.response || !resError.response.data) {
        throw resError
      }
      // server responded with error message, create an Error from that
      throw Error(resError.response.data)
    }
  }

  // returns an async function which makes a request for the given
  // HTTP method (GET/POST/DELETE/etc) and path (/foo/bar)
  function req(method, path) {
    return async function(data) {
      return await request(method, path, data)
    }
  }

  // returns an async function which makes a request for the given
  // HTTP method and path, which accepts arguments to be appended
  // to the path (/foo/{arg}/...)
  function argReq(method, prefix, suffix = ``) {
    return function(args, data) {
      // `args` can either be a single value or an array
      if (Array.isArray(args)) {
        args = args.join(`/`)
      }
      if (method === `DELETE`) {
        data = { data }
      }
      return request(method, `${prefix}/${args}${suffix}`, data)
    }
  }

  let fetchAccount = argReq(`GET`, `/accounts`)

  const keys = {
    add: req(`POST`, `/keys`),

    // axios handles DELETE requests different then other requests, we have to but the body in a config object with the prop data
    delete: argReq(`DELETE`, `/keys`),

    get: argReq(`GET`, `/keys`),
    set: argReq(`PUT`, `/keys`),
    values: req(`GET`, `/keys`)
  }

  return {
    // meta
    lcdConnected: function() {
      return keys.values().then(() => true, () => false)
    },

    // tx
    postTx: req(`POST`, `/tx`),

    keys,

    // coins
    send: argReq(`POST`, `/accounts`, `/send`),
    ibcSend: argReq(`POST`, `/ibc`, `/send`),
    queryAccount(address) {
      return fetchAccount(address)
        .then(res => {
          return res.value
        })
        .catch(err => {
          // if account not found, return null instead of throwing
          if (err.message.includes(`account bytes are empty`)) {
            return null
          }
          throw err
        })
    },
    txs: function(addr) {
      return Promise.all([
        req(`GET`, `/txs?tag=sender_bech32='${addr}'`)(),
        req(`GET`, `/txs?tag=recipient_bech32='${addr}'`)()
      ]).then(([senderTxs, recipientTxs]) => [].concat(senderTxs, recipientTxs))
    },
    tx: argReq(`GET`, `/txs`),

    /* ============ STAKE ============ */

    // Get all delegations information from a delegator
    getDelegator: function(addr) {
      return req(`GET`, `/stake/delegators/${addr}`)()
    },
    // Get all txs from a delegator
    getDelegatorTxs: function(addr, types) {
      if (!types) {
        return req(`GET`, `/stake/delegators/${addr}/txs`)()
      } else {
        return req(`GET`, `/stake/delegators/${addr}/txs?type=${types}`)()
      }
    },
    // Query all validators that a delegator is bonded to
    getDelegatorValidators: function(delegatorAddr) {
      return req(`GET`, `/stake/delegators/${delegatorAddr}/validators`)()
    },
    // // Query a validator info that a delegator is bonded to
    // getDelegatorValidator: function(delegatorAddr, validatorAddr) {
    //   return req("GET", `/stake/delegators/${delegatorAddr}/validators/${validatorAddr}`)()
    // },

    // Get a list containing all the validator candidates
    getCandidates: req(`GET`, `/stake/validators`),
    // Get information from a validator
    getCandidate: function(addr) {
      return req(`GET`, `/stake/validators/${addr}`)()
    },
    // // Get all of the validator bonded delegators
    // getValidatorDelegators: function(addr) {
    //   return req("GET", `/stake/validator/${addr}/delegators`)()
    // },

    // Get the list of the validators in the latest validator set
    getValidatorSet: req(`GET`, `/validatorsets/latest`),

    updateDelegations: function(delegatorAddr, data) {
      return req(`POST`, `/stake/delegators/${delegatorAddr}/delegations`)(data)
    },

    // Query a delegation between a delegator and a validator
    queryDelegation: function(delegatorAddr, validatorAddr) {
      return req(
        `GET`,
        `/stake/delegators/${delegatorAddr}/delegations/${validatorAddr}`
      )()
    },
    queryUnbonding: function(delegatorAddr, validatorAddr) {
      return req(
        `GET`,
        `/stake/delegators/${delegatorAddr}/unbonding_delegations/${validatorAddr}`
      )()
    },
    getPool: req(`GET`, `/stake/pool`),
    getParameters: req(`GET`, `/stake/parameters`),

    /* ============ Slashing ============ */

    queryValidatorSigningInfo: function(pubKey) {
      return req(`GET`, `/slashing/signing_info/${pubKey}`)()
    }
  }
}

module.exports = Client
