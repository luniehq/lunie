"use strict"

const RETRIES = 4

const Client = (axios, remoteLcdURL) => {
  // request and retry
  async function request(method, path, data, tries = RETRIES) {
    const url = remoteLcdURL
    let result
    while (tries) {
      try {
        result = await axios({ data, method, url: url + path })
        break
      } catch (err) {
        if (--tries == 0) {
          throw err
        }
      }
    }
    return result.data
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

  return {
    // meta
    lcdConnected: function() {
      return this.nodeVersion().then(() => true, () => false)
    },

    nodeVersion: req(`GET`, `/node_version`),

    // tx
    postTx: req(`POST`, `/txs`),

    // coins
    send: argReq(`POST`, `/bank/accounts`, `/transfers`),
    getAccount: function(address) {
      const emptyAccount = {
        coins: [],
        sequence: `0`,
        account_number: `0`
      }
      return req(`GET`, `/auth/accounts/${address}`)()
        .then(res => {
          // HACK, hope for: https://github.com/cosmos/cosmos-sdk/issues/3885
          let account = res.value || emptyAccount
          if (res.type === `auth/DelayedVestingAccount`) {
            if (!account.BaseVestingAccount) {
              console.error(
                `SDK format of vesting accounts responses has changed`
              )
              return emptyAccount
            }
            account = Object.assign(
              {},
              account.BaseVestingAccount.BaseAccount,
              account.BaseVestingAccount
            )
            delete account.BaseAccount
            delete account.BaseVestingAccount
          }
          return account
        })
        .catch(err => {
          // if account not found, return null instead of throwing
          if (
            err.response &&
            (err.response.data.includes(`account bytes are empty`) ||
              err.response.data.includes(`failed to prove merkle proof`))
          ) {
            return emptyAccount
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
    getTxsByHeight: function(height) {
      return req(`GET`, `/txs?tx.height=${height}`)()
    },
    tx: argReq(`GET`, `/txs`),

    /* ============ STAKE ============ */
    getStakingTxs: async function(address, valAddress) {
      // const validatorAddress = delegatorToValidatorAddress(address)
      // console.log(validatorAddress)
      return await Promise.all([
        req(
          `GET`,
          `/txs?action=create_validator&destination-validator=${valAddress}`
        )(),
        req(
          `GET`,
          `/txs?action=edit_validator&destination-validator=${valAddress}`
        )(),
        req(`GET`, `/txs?action=delegate&delegator=${address}`)(),
        req(`GET`, `/txs?action=begin_redelegate&delegator=${address}`)(),
        req(`GET`, `/txs?action=begin_unbonding&delegator=${address}`)(),
        req(`GET`, `/txs?action=unjail&source-validator=${valAddress}`)()
      ]).then(
        ([
          createValidatorTxs,
          editValidatorTxs,
          delegationTxs,
          redelegationTxs,
          undelegationTxs,
          unjailTxs
        ]) =>
          [].concat(
            createValidatorTxs,
            editValidatorTxs,
            delegationTxs,
            redelegationTxs,
            undelegationTxs,
            unjailTxs
          )
      )
    },
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
    // Query all validators that a delegator is bonded to
    getDelegatorValidators: function(delegatorAddr) {
      return req(`GET`, `/staking/delegators/${delegatorAddr}/validators`)()
    },
    // // Query a validator info that a delegator is bonded to
    // getDelegatorValidator: function(delegatorAddr, validatorAddr) {
    //   return req("GET", `/staking/delegators/${delegatorAddr}/validators/${validatorAddr}`)()
    // },

    // Get a list containing all the validator candidates
    getValidators: async () =>
      await Promise.all([
        req(`GET`, `/staking/validators?status=bonded`)(),
        req(`GET`, `/staking/validators?status=unbonded`)(),
        req(`GET`, `/staking/validators?status=unbonding`)()
      ]).then(([bondedValidators, unbondedValidators, unbondingValidators]) =>
        [].concat(bondedValidators, unbondedValidators, unbondingValidators)
      ),
    // Get information from a validator
    getValidator: function(addr) {
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
    getDelegation: function(delegatorAddr, validatorAddr) {
      return req(
        `GET`,
        `/staking/delegators/${delegatorAddr}/delegations/${validatorAddr}`,
        true
      )()
    },
    getUnbondingDelegation: function(delegatorAddr, validatorAddr) {
      return req(
        `GET`,
        `/staking/delegators/${delegatorAddr}/unbonding_delegations/${validatorAddr}`,
        true
      )()
    },
    getPool: req(`GET`, `/staking/pool`),
    getStakingParameters: req(`GET`, `/staking/parameters`),

    /* ============ Slashing ============ */

    getValidatorSigningInfo: function(pubKey) {
      return req(`GET`, `/slashing/validators/${pubKey}/signing_info`)()
    },

    /* ============ Governance ============ */

    getProposals: req(`GET`, `/gov/proposals`),
    getProposal: function(proposalId) {
      return req(`GET`, `/gov/proposals/${proposalId}`)()
    },
    getProposalVotes: function(proposalId) {
      return req(`GET`, `/gov/proposals/${proposalId}/votes`)()
    },
    getProposalVote: function(proposalId, address) {
      return req(`GET`, `/gov/proposals/${proposalId}/votes/${address}`)()
    },
    getProposalDeposits: function(proposalId) {
      return req(`GET`, `/gov/proposals/${proposalId}/deposits`)()
    },
    getProposalDeposit: function(proposalId, address) {
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
    postProposal: function(data) {
      return req(`POST`, `/gov/proposals`)(data)
    },
    postProposalVote: function(proposalId, data) {
      return req(`POST`, `/gov/proposals/${proposalId}/votes`)(data)
    },
    postProposalDeposit: function(proposalId, data) {
      return req(`POST`, `/gov/proposals/${proposalId}/deposits`)(data)
    },
    getGovernanceTxs: async function(address) {
      return await Promise.all([
        req(`GET`, `/txs?action=submit_proposal&proposer=${address}`)(),
        req(`GET`, `/txs?action=deposit&depositor=${address}`)(),
        req(`GET`, `/txs?action=vote&voter=${address}`)()
      ]).then(([submitProposalTxs, depositTxs, voteTxs]) =>
        [].concat(submitProposalTxs, depositTxs, voteTxs)
      )
    },
    /* ============ Explorer ============ */
    getBlock: function(blockHeight) {
      return req(`GET`, `/blocks/${blockHeight}`)()
    },
    /* ============ Distribution ============ */
    getDistributionTxs: async function(address, valAddress) {
      return await Promise.all([
        req(`GET`, `/txs?action=set_withdraw_address&delegator=${address}`)(),
        req(
          `GET`,
          `/txs?action=withdraw_delegator_reward&delegator=${address}`
        )(),
        req(
          `GET`,
          `/txs?action=withdraw_validator_rewards_all&source-validator=${valAddress}`
        )()
      ]).then(
        ([
          updateWithdrawAddressTxs,
          withdrawDelegationRewardsTxs,
          withdrawValidatorCommissionTxs
        ]) =>
          [].concat(
            updateWithdrawAddressTxs,
            withdrawDelegationRewardsTxs,
            withdrawValidatorCommissionTxs
          )
      )
    },
    getDelegatorRewards: function(delegatorAddr) {
      return req(`GET`, `/distribution/delegators/${delegatorAddr}/rewards`)()
    },
    postWithdrawDelegatorRewards: function(delegatorAddr, data) {
      return req(`POST`, `/distribution/delegators/${delegatorAddr}/rewards`)(
        data
      )
    },
    getDelegatorRewardsFromValidator: function(delegatorAddr, validatorAddr) {
      return req(
        `GET`,
        `/distribution/delegators/${delegatorAddr}/rewards/${validatorAddr}`
      )()
    },
    getValidatorDistributionInformation: function(validatorAddr) {
      return req(`GET`, `/distribution/validators/${validatorAddr}`)()
    },
    getValidatorRewards: function(validatorAddr) {
      return req(`GET`, `/distribution/validators/${validatorAddr}/rewards`)()
    },
    getDistributionParameters: function() {
      return req(`GET`, `/distribution/parameters`)()
    },
    getDistributionOutstandingRewards: function() {
      return req(`GET`, `/distribution/outstanding_rewards`)()
    }
  }
}

export default Client
