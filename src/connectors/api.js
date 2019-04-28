"use strict"

const Client = (cosmosRESTURL) => {
  function get(path) {
    return fetch(cosmosRESTURL + path).then(res => res.json())
  }
  return {
    url: cosmosRESTURL,

    // meta
    lcdConnected: function () {
      return this.nodeVersion().then(() => true, () => false)
    },

    nodeVersion: () => fetch(cosmosRESTURL + `/node_version`).then(res => res.text()),

    // coins
    getAccount: function (address) {
      const emptyAccount = {
        coins: [],
        sequence: `0`,
        account_number: `0`
      }
      return get(`/auth/accounts/${address}`)
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
    txs: function (addr) {
      return Promise.all([
        get(`/txs?sender=${addr}`),
        get(`/txs?recipient=${addr}`)
      ]).then(([senderTxs, recipientTxs]) => [].concat(senderTxs, recipientTxs))
    },
    getTxsByHeight: function (height) {
      return get(`/txs?tx.height=${height}`)
    },
    tx: hash => get(`/txs/${hash}`),

    /* ============ STAKE ============ */
    getStakingTxs: async function (address, valAddress) {
      // const validatorAddress = delegatorToValidatorAddress(address)
      // console.log(validatorAddress)
      return await Promise.all([
        get(
          `/txs?action=create_validator&destination-validator=${valAddress}`),
        get(
          `/txs?action=edit_validator&destination-validator=${valAddress}`),
        get(`/txs?action=delegate&delegator=${address}`),
        get(`/txs?action=begin_redelegate&delegator=${address}`),
        get(`/txs?action=begin_unbonding&delegator=${address}`),
        get(`/txs?action=unjail&source-validator=${valAddress}`)
      ]).then(([
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
    getDelegations: function (addr) {
      return get(`/staking/delegators/${addr}/delegations`)
    },
    getUndelegations: function (addr) {
      return get(

        `/staking/delegators/${addr}/unbonding_delegations`,
        true
      )
    },
    getRedelegations: function (addr) {
      return get(`/staking/redelegations?delegator=${addr}`)
    },
    // Query all validators that a delegator is bonded to
    getDelegatorValidators: function (delegatorAddr) {
      return get(`/staking/delegators/${delegatorAddr}/validators`)
    },
    // Get a list containing all the validator candidates
    getValidators: () => get(`/staking/validators`),
    // Get information from a validator
    getValidator: function (addr) {
      return get(`/staking/validators/${addr}`)
    },

    // Get the list of the validators in the latest validator set
    getValidatorSet: () => get(`/validatorsets/latest`),

    // Query a delegation between a delegator and a validator
    getDelegation: function (delegatorAddr, validatorAddr) {
      return get(

        `/staking/delegators/${delegatorAddr}/delegations/${validatorAddr}`,
        true
      )
    },
    getUnbondingDelegation: function (delegatorAddr, validatorAddr) {
      return get(

        `/staking/delegators/${delegatorAddr}/unbonding_delegations/${validatorAddr}`,
        true
      )
    },
    getPool: () => get(`/staking/pool`),
    getStakingParameters: () => get(`/staking/parameters`),

    /* ============ Slashing ============ */

    getValidatorSigningInfo: function (pubKey) {
      return get(`/slashing/validators/${pubKey}/signing_info`)
    },

    /* ============ Governance ============ */

    getProposals: () => get(`/gov/proposals`),
    getProposal: function (proposalId) {
      return get(`/gov/proposals/${proposalId}`)
    },
    getProposalVotes: function (proposalId) {
      return get(`/gov/proposals/${proposalId}/votes`)
    },
    getProposalVote: function (proposalId, address) {
      return get(`/gov/proposals/${proposalId}/votes/${address}`)
    },
    getProposalDeposits: function (proposalId) {
      return get(`/gov/proposals/${proposalId}/deposits`)
    },
    getProposalDeposit: function (proposalId, address) {
      return get(

        `/gov/proposals/${proposalId}/deposits/${address}`,
        true
      )
    },
    getProposalTally: function (proposalId) {
      return get(`/gov/proposals/${proposalId}/tally`)
    },
    getGovDepositParameters: () => get(`/gov/parameters/deposit`),
    getGovTallyingParameters: () => get(`/gov/parameters/tallying`),
    getGovVotingParameters: () => get(`/gov/parameters/voting`),
    getGovernanceTxs: async function (address) {
      return await Promise.all([
        get(`/txs?action=submit_proposal&proposer=${address}`),
        get(`/txs?action=deposit&depositor=${address}`),
        get(`/txs?action=vote&voter=${address}`)
      ]).then(([submitProposalTxs, depositTxs, voteTxs]) =>
        [].concat(submitProposalTxs, depositTxs, voteTxs)
      )
    },
    /* ============ Explorer ============ */
    getBlock: function (blockHeight) {
      return get(`/blocks/${blockHeight}`)
    },
    /* ============ Distribution ============ */
    getDistributionTxs: async function (address, valAddress) {
      return await Promise.all([
        get(`/txs?action=set_withdraw_address&delegator=${address}`),
        get(`/txs?action=withdraw_delegator_reward&delegator=${address}`),
        get(`/txs?action=withdraw_validator_rewards_all&source-validator=${valAddress}`)
      ]).then(([
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
    getDelegatorRewards: function (delegatorAddr) {
      return get(`/distribution/delegators/${delegatorAddr}/rewards`)
    },
    postWithdrawDelegatorRewards: function (delegatorAddr, data) {
      return get(`POST`, `/distribution/delegators/${delegatorAddr}/rewards`)(
        data
      )
    },
    getDelegatorRewardsFromValidator: function (delegatorAddr, validatorAddr) {
      return get(

        `/distribution/delegators/${delegatorAddr}/rewards/${validatorAddr}`
      )
    },
    getValidatorDistributionInformation: function (validatorAddr) {
      return get(`/distribution/validators/${validatorAddr}`)
    },
    getValidatorRewards: function (validatorAddr) {
      return get(`/distribution/validators/${validatorAddr}/rewards`)
    },
    getDistributionParameters: function () {
      return get(`/distribution/parameters`)
    },
    getDistributionOutstandingRewards: function () {
      return get(`/distribution/outstanding_rewards`)
    }
  }
}

export default Client
