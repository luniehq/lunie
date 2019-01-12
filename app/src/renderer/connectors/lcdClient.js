"use strict"

const Client = (axios, localLcdURL, remoteLcdURL) => {
  async function request(method, path, data) {
    const url = remoteLcdURL
    try {
      const result = await axios({ data, method, url: url + path })
      return result.data
    } catch (err) {
      // HACK
      if (
        err.response &&
        err.response.data.startsWith(`failed to prove merkle proof`)
      ) {
        return {}
      }
      if (err.response.status === 502) {
        // retry
        return await request(method, path, data)
      }
      throw err
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
      return request(method, `${prefix}/${args}${suffix}`, data)
    }
  }

  let fetchAccount = argReq(`GET`, `/auth/accounts`)

  return {
    // meta
    lcdConnected: function() {
      return req(`GET`, `/node_version`).then(() => true, () => false)
    },

    nodeVersion: req(`GET`, `/node_version`),

    // tx
    postTx: req(`POST`, `/tx/broadcast`),

    // coins
    send: argReq(`POST`, `/bank/accounts`, `/transfers`),
    queryAccount(address) {
      return fetchAccount(address)
        .then(res => {
          return res.value
        })
        .catch(err => {
          // if account not found, return null instead of throwing
          if (
            err.response &&
            err.response.data.includes(`account bytes are empty`)
          ) {
            return null
          }
          throw err
        })
    },
    txs: function(addr) {
      return Promise.all([
        req(`GET`, `/txs?sender=${addr}`)(),
        req(`GET`, `/txs?recipient=${addr}`)()
      ]).then(([senderTxs, recipientTxs]) => [].concat(senderTxs, recipientTxs))
    },
    tx: argReq(`GET`, `/txs`),

    /* ============ STAKE ============ */

    // Get all delegations information from a delegator
    getDelegations: function(addr) {
      return req(`GET`, `/staking/delegators/${addr}/delegations`)()
    },
    getUndelegations: function(addr) {
      return req(
        `GET`,
        `/staking/delegators/${addr}/unbonding_delegations`,
        true
      )()
    },
    getRedelegations: function(addr) {
      return req(`GET`, `/staking/redelegations?delegator=${addr}`)()
    },
    // Get all txs from a delegator
    getDelegatorTxs: function(addr, types) {
      if (!types) {
        return req(`GET`, `/staking/delegators/${addr}/txs`)()
      } else {
        return req(`GET`, `/staking/delegators/${addr}/txs?type=${types}`)()
      }
    },
    // Query all validators that a delegator is bonded to
    getDelegatorValidators: function(delegatorAddr) {
      return req(`GET`, `/staking/delegators/${delegatorAddr}/validators`)()
    },
    // // Query a validator info that a delegator is bonded to
    // getDelegatorValidator: function(delegatorAddr, validatorAddr) {
    //   return req("GET", `/staking/delegators/${delegatorAddr}/validators/${validatorAddr}`)()
    // },

    // Get a list containing all the validator candidates
    getCandidates: req(`GET`, `/staking/validators`),
    // Get information from a validator
    getCandidate: function(addr) {
      return req(`GET`, `/staking/validators/${addr}`)()
    },
    // // Get all of the validator bonded delegators
    // getValidatorDelegators: function(addr) {
    //   return req("GET", `/staking/validator/${addr}/delegators`)()
    // },

    // Get the list of the validators in the latest validator set
    getValidatorSet: req(`GET`, `/validatorsets/latest`),

    postDelegation: function(delegatorAddr, data) {
      return req(
        `POST`,
        `/staking/delegators/${delegatorAddr}/delegations`,
        true
      )(data)
    },
    postUnbondingDelegation: function(delegatorAddr, data) {
      return req(
        `POST`,
        `/staking/delegators/${delegatorAddr}/unbonding_delegations`
      )(data)
    },
    postRedelegation: function(delegatorAddr, data) {
      return req(
        `POST`,
        `/staking/delegators/${delegatorAddr}/redelegations`,
        true
      )(data)
    },

    // Query a delegation between a delegator and a validator
    queryDelegation: function(delegatorAddr, validatorAddr) {
      return req(
        `GET`,
        `/staking/delegators/${delegatorAddr}/delegations/${validatorAddr}`,
        true
      )()
    },
    queryUnbonding: function(delegatorAddr, validatorAddr) {
      return req(
        `GET`,
        `/staking/delegators/${delegatorAddr}/unbonding_delegations/${validatorAddr}`,
        true
      )()
    },
    getPool: req(`GET`, `/staking/pool`),
    getStakingParameters: req(`GET`, `/staking/parameters`),

    /* ============ Slashing ============ */

    queryValidatorSigningInfo: function(pubKey) {
      return req(`GET`, `/slashing/validators/${pubKey}/signing_info`)()
    },

    /* ============ Governance ============ */

    queryProposals: req(`GET`, `/gov/proposals`),
    queryProposal: function(proposalId) {
      return req(`GET`, `/gov/proposals/${proposalId}`)()
    },
    queryProposalVotes: function(proposalId) {
      return req(`GET`, `/gov/proposals/${proposalId}/votes`)()
    },
    queryProposalVote: function(proposalId, address) {
      return req(`GET`, `/gov/proposals/${proposalId}/votes/${address}`)()
    },
    queryProposalDeposits: function(proposalId) {
      return req(`GET`, `/gov/proposals/${proposalId}/deposits`)()
    },
    queryProposalDeposit: function(proposalId, address) {
      return req(
        `GET`,
        `/gov/proposals/${proposalId}/deposits/${address}`,
        true
      )()
    },
    getProposalTally: function(proposalId) {
      return req(`GET`, `/gov/proposals/${proposalId}/tally`)()
    },
    getGovDepositParameters: req(`GET`, `/gov/parameters/deposit`),
    getGovTallyingParameters: req(`GET`, `/gov/parameters/tallying`),
    getGovVotingParameters: req(`GET`, `/gov/parameters/voting`),
    submitProposal: function(data) {
      return req(`POST`, `/gov/proposals`)(data)
    },
    submitProposalVote: function(proposalId, data) {
      return req(`POST`, `/gov/proposals/${proposalId}/votes`)(data)
    },
    submitProposalDeposit: function(proposalId, data) {
      return req(`POST`, `/gov/proposals/${proposalId}/deposits`)(data)
    },
    getGovernanceTxs: async function(address) {
      return await Promise.all([
        req(`GET`, `/txs?action=submit_proposal&proposer=${address}`)(),
        req(`GET`, `/txs?action=deposit&depositor=${address}`)()
      ]).then(([depositorTxs, proposerTxs]) =>
        [].concat(depositorTxs, proposerTxs)
      )
    }
  }
}

module.exports = Client
