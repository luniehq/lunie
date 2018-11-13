"use strict"

const Client = (axios, localLcdURL, remoteLcdURL) => {
  async function request(method, path, data, useRemote) {
    const url = useRemote ? remoteLcdURL : localLcdURL
    return (await axios({ data, method, url: url + path })).data
  }

  // returns an async function which makes a request for the given
  // HTTP method (GET/POST/DELETE/etc) and path (/foo/bar)
  function req(method, path, useRemote) {
    return async function(data) {
      return await request(method, path, data, useRemote)
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

      return request(method, `${prefix}/${args}${suffix}`, data, useRemote)
    }
  }

  let fetchAccount = argReq(`GET`, `/auth/accounts`)

  const keys = {
    add: req(`POST`, `/keys`),
    delete: argReq(`DELETE`, `/keys`),

    get: async key => {
      try {
        return await req(`GET`, `/keys/${key}`)()
      } catch (exception) {
        if (exception.response.status !== 404) {
          throw exception
        }
      }
    },

    seed: () => keys.get(`seed`),
    set: argReq(`PUT`, `/keys`),

    values: async () => {
      const values = await req(`GET`, `/keys`)()
      // Workaround for https://github.com/cosmos/cosmos-sdk/issues/2470
      return values === `[]` ? [] : values
    }
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
    send: argReq(`POST`, `/bank/accounts`, `/transfers`),
    queryAccount(address) {
      return fetchAccount(address)
        .then(res => {
          return res.value
        })
        .catch(err => {
          // if account not found, return null instead of throwing
          if (err.response.data.includes(`account bytes are empty`)) {
            return null
          }
          throw err
        })
    },
    txs: function(addr) {
      return Promise.all([
        req(`GET`, `/txs?tag=sender_bech32='${addr}'`, true)(),
        req(`GET`, `/txs?tag=recipient_bech32='${addr}'`, true)()
      ]).then(([senderTxs, recipientTxs]) => [].concat(senderTxs, recipientTxs))
    },
    tx: argReq(`GET`, `/txs`, ``, true),

    /* ============ STAKE ============ */

    // Get all delegations information from a delegator
    getDelegator: function(addr) {
      return req(`GET`, `/stake/delegators/${addr}`, true)()
    },
    // Get all txs from a delegator
    getDelegatorTxs: function(addr, types) {
      if (!types) {
        return req(`GET`, `/stake/delegators/${addr}/txs`, true)()
      } else {
        return req(`GET`, `/stake/delegators/${addr}/txs?type=${types}`, true)()
      }
    },
    // Query all validators that a delegator is bonded to
    getDelegatorValidators: function(delegatorAddr) {
      return req(`GET`, `/stake/delegators/${delegatorAddr}/validators`, true)()
    },
    // // Query a validator info that a delegator is bonded to
    // getDelegatorValidator: function(delegatorAddr, validatorAddr) {
    //   return req("GET", `/stake/delegators/${delegatorAddr}/validators/${validatorAddr}`)()
    // },

    // Get a list containing all the validator candidates
    getCandidates: req(`GET`, `/stake/validators`, true),
    // Get information from a validator
    getCandidate: function(addr) {
      return req(`GET`, `/stake/validators/${addr}`, true)()
    },
    // // Get all of the validator bonded delegators
    // getValidatorDelegators: function(addr) {
    //   return req("GET", `/stake/validator/${addr}/delegators`)()
    // },

    // Get the list of the validators in the latest validator set
    getValidatorSet: req(`GET`, `/validatorsets/latest`, true),

    updateDelegations: function(delegatorAddr, data) {
      return req(`POST`, `/stake/delegators/${delegatorAddr}/delegations`)(data)
    },

    // Query a delegation between a delegator and a validator
    queryDelegation: function(delegatorAddr, validatorAddr) {
      return req(
        `GET`,
        `/stake/delegators/${delegatorAddr}/delegations/${validatorAddr}`,
        true
      )()
    },
    queryUnbonding: function(delegatorAddr, validatorAddr) {
      return req(
        `GET`,
        `/stake/delegators/${delegatorAddr}/unbonding_delegations/${validatorAddr}`,
        true
      )()
    },
    getPool: req(`GET`, `/stake/pool`, true),
    getParameters: req(`GET`, `/stake/parameters`, true),

    /* ============ Slashing ============ */

    queryValidatorSigningInfo: function(pubKey) {
      return req(`GET`, `/slashing/signing_info/${pubKey}`, true)()
    },

    /* ============ Governance ============ */

    queryProposals: req(`GET`, `/gov/proposals`, true),
    queryProposal: function(proposalId) {
      return req(`GET`, `/gov/proposals/${proposalId}`, true)()
    },
    queryProposalVotes: function(proposalId) {
      return req(`GET`, `/gov/proposals/${proposalId}/votes`, true)()
    },
    queryProposalVote: function(proposalId, address) {
      return req(`GET`, `/gov/proposals/${proposalId}/votes/${address}`, true)()
    },
    queryProposalDeposits: function(proposalId) {
      return req(`GET`, `/gov/proposals/${proposalId}/deposits`, true)()
    },
    queryProposalDeposit: function(proposalId, address) {
      return req(
        `GET`,
        `/gov/proposals/${proposalId}/deposits/${address}`,
        true
      )()
    },
    getGovernanceTxs: function(addr) {
      return Promise.all([
        req(
          `GET`,
          `/txs?tag=action=submit-proposal&proposer='${addr}'`,
          true
        )(),
        req(`GET`, `/txs?tag=action=deposit&depositer='${addr}'`, true)()
      ]).then(([proposalTxs, depositTxs]) => [].concat(proposalTxs, depositTxs))
    },
    submitProposal: function(data) {
      return req(`POST`, `/gov/proposals`, true)(data)
    },
    submitProposalVote: function(proposalId, data) {
      return req(`POST`, `/gov/proposals/${proposalId}/votes`, true)(data)
    },
    submitProposalDeposit: function(proposalId, data) {
      return req(`POST`, `/gov/proposals/${proposalId}/deposits`, true)(data)
    }
  }
}

module.exports = Client
