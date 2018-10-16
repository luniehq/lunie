"use strict"

const axios = require(`axios`)

// returns an async function which makes a request for the given
// HTTP method (GET/POST/DELETE/etc) and path (/foo/bar)
function req(method, path, useRemote) {
  return async function(data) {
    return await this.request(method, path, data, useRemote)
  }
}

// returns an async function which makes a request for the given
// HTTP method and path, which accepts arguments to be appended
// to the path (/foo/{arg}/...)
function argReq(method, prefix, suffix = ``, useRemote) {
  return function(args, data) {
    // `args` can either be a single value or an array
    if (Array.isArray(args)) {
      args = args.join(`/`)
    }
    if (method === `DELETE`) {
      data = { data }
    }
    return this.request(method, `${prefix}/${args}${suffix}`, data, useRemote)
  }
}

class Client {
  constructor(localLcdURL, remoteLcdURL) {
    this.localLcdURL = localLcdURL
    this.remoteLcdURL = remoteLcdURL
  }

  async request(method, path, data, useRemote) {
    let url = useRemote ? this.remoteLcdURL : this.localLcdURL
    try {
      let res = await axios[method.toLowerCase()](url + path, data)
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

let fetchAccount = argReq(`GET`, `/accounts`)

Object.assign(Client.prototype, {
  // meta
  lcdConnected: function() {
    return this.listKeys().then(() => true, () => false)
  },

  // tx
  postTx: req(`POST`, `/tx`),

  // keys
  generateSeed: req(`GET`, `/keys/seed`),
  listKeys: req(`GET`, `/keys`),
  storeKey: req(`POST`, `/keys`),
  getKey: argReq(`GET`, `/keys`),
  updateKey: argReq(`PUT`, `/keys`),
  // axios handles DELETE requests different then other requests, we have to but the body in a config object with the prop data
  deleteKey: argReq(`DELETE`, `/keys`),

  // coins
  send: argReq(`POST`, `/accounts`, `/send`),
  ibcSend: argReq(`POST`, `/ibc`, `/send`),
  queryAccount(address) {
    return fetchAccount
      .call(this, address)
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
      req(`GET`, `/txs?tag=sender_bech32='${addr}'`, true).call(this),
      req(`GET`, `/txs?tag=recipient_bech32='${addr}'`, true).call(this)
    ]).then(([senderTxs, recipientTxs]) => [].concat(senderTxs, recipientTxs))
  },
  tx: argReq(`GET`, `/txs`, ``, true),

  /* ============ STAKE ============ */

  // Get all delegations information from a delegator
  getDelegator: function(addr) {
    return req(`GET`, `/stake/delegators/${addr}`, true).call(this)
  },
  // Get all txs from a delegator
  getDelegatorTxs: function(addr, types) {
    if (!types) {
      return req(`GET`, `/stake/delegators/${addr}/txs`, true).call(this)
    } else {
      return req(
        `GET`,
        `/stake/delegators/${addr}/txs?type=${types}`,
        true
      ).call(this)
    }
  },
  // Query all validators that a delegator is bonded to
  getDelegatorValidators: function(delegatorAddr) {
    return req(
      `GET`,
      `/stake/delegators/${delegatorAddr}/validators`,
      true
    ).call(this)
  },
  // // Query a validator info that a delegator is bonded to
  // getDelegatorValidator: function(delegatorAddr, validatorAddr) {
  //   return req("GET", `/stake/delegators/${delegatorAddr}/validators/${validatorAddr}`).call(this)
  // },

  // Get a list containing all the validator candidates
  getCandidates: req(`GET`, `/stake/validators`, true),
  // Get information from a validator
  getCandidate: function(addr) {
    return req(`GET`, `/stake/validators/${addr}`, true).call(this)
  },
  // // Get all of the validator bonded delegators
  // getValidatorDelegators: function(addr) {
  //   return req("GET", `/stake/validator/${addr}/delegators`).call(this)
  // },

  // Get the list of the validators in the latest validator set
  getValidatorSet: req(`GET`, `/validatorsets/latest`, true),

  updateDelegations: function(delegatorAddr, data) {
    return req(`POST`, `/stake/delegators/${delegatorAddr}/delegations`).call(
      this,
      data
    )
  },

  // Query a delegation between a delegator and a validator
  queryDelegation: function(delegatorAddr, validatorAddr) {
    return req(
      `GET`,
      `/stake/delegators/${delegatorAddr}/delegations/${validatorAddr}`,
      true
    ).call(this)
  },
  queryUnbonding: function(delegatorAddr, validatorAddr) {
    return req(
      `GET`,
      `/stake/delegators/${delegatorAddr}/unbonding_delegations/${validatorAddr}`,
      true
    ).call(this)
  },
  getPool: req(`GET`, `/stake/pool`, true),
  getParameters: req(`GET`, `/stake/parameters`, true),

  /* ============ Slashing ============ */

  queryValidatorSigningInfo: function(pubKey) {
    return req(`GET`, `/slashing/signing_info/${pubKey}`, true).call(this)
  },

  /* ============ Governance ============ */

  queryProposals: req(`GET`, `/gov/proposals`, true),
  queryProposal: function(proposalId) {
    return req(`GET`, `/gov/proposals/${proposalId}`, true).call(this)
  },
  queryProposalVotes: function(proposalId) {
    return req(`GET`, `/gov/proposals/${proposalId}/votes`, true).call(this)
  },
  queryProposalVote: function(proposalId, address) {
    return req(
      `GET`,
      `/gov/proposals/${proposalId}/votes/${address}`,
      true
    ).call(this)
  },
  queryProposalDeposits: function(proposalId) {
    return req(`GET`, `/gov/proposals/${proposalId}/deposits`, true).call(this)
  },
  queryProposalDeposit: function(proposalId, address) {
    return req(
      `GET`,
      `/gov/proposals/${proposalId}/deposits/${address}`,
      true
    ).call(this)
  },
  submitProposal: function(data) {
    return req(`POST`, `/gov/proposals`, true).call(this, data)
  },
  submitVote: function(proposalId, data) {
    return req(`POST`, `/gov/proposals/${proposalId}/votes`, true).call(
      this,
      data
    )
  },
  submitDeposit: function(proposalId, data) {
    return req(`POST`, `/gov/proposals/${proposalId}/deposits`, true).call(
      this,
      data
    )
  }
})

module.exports = Client
