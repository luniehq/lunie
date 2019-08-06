import * as Sentry from "@sentry/browser"
import Vue from "vue"
import { coinsToObject } from "scripts/common.js"

export default ({ node }) => {
  const emptyState = {
    loading: false,
    loaded: false,
    error: null,
    /* rewards use the following format:
        {
            validatorAddr1: {
                denom1: amount1,
                ... ,
                denomN: amountN
            },
            ... ,
            validatorAddrN: {
                denom1: amount1,
                ... ,
                denomN: amountN
            }
        }
    */
    rewards: {},
    parameters: {},
    /* outstandingRewards use the following format:
        {
            denom1: amount1,
            ... ,
            denomN: amountN
        }
    */
    outstandingRewards: {}
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setDelegationRewards(state, { validatorAddr, rewards }) {
      Vue.set(state.rewards, validatorAddr, rewards)
    },
    setDistributionParameters(state, parameters) {
      state.parameters = parameters
    },
    setOutstandingRewards(state, outstandingRewards) {
      state.outstandingRewards = outstandingRewards
    },
    setDistributionError(state, error) {
      state.error = error
    }
  }
  const actions = {
    async reconnected({ rootState, state, dispatch }) {
      if (state.loading && rootState.session.signedIn) {
        await dispatch(`getRewardsFromMyValidators`)
      }
    },
    resetSessionData({ rootState }) {
      rootState.distribution = JSON.parse(JSON.stringify(emptyState))
    },
    async initializeWallet({ dispatch }) {
      dispatch(`getRewardsFromMyValidators`)
    },
    async postMsgWithdrawDelegationReward({ dispatch }) {
      return Promise.all([
        dispatch(`getRewardsFromMyValidators`),
        dispatch(`queryWalletBalances`),
        dispatch(`getAllTxs`)
      ])
    },
    async getRewardsFromMyValidators({
      state,
      dispatch,
      getters: { yourValidators }
    }) {
      state.loading = true
      await Promise.all(
        yourValidators.map(validator =>
          dispatch(`getRewardsFromValidator`, validator.operator_address)
        )
      )
      state.loading = false
      state.loaded = true
    },
    async getRewardsFromValidator(
      {
        state,
        rootState: { session },
        getters: { bondDenom },
        commit
      },
      validatorAddr
    ) {
      state.loading = true
      try {
        // TODO move array fallback into cosmos-api
        const rewardsArray =
          (await node.get.delegatorRewardsFromValidator(
            session.address,
            validatorAddr
          )) || []
        const rewards = coinsToObject(rewardsArray)

        // if the delegator has 0 rewards for a validator after a withdraw, this is trimmed
        // to properly differentiate between 0 rewards and no delegation,
        // we set the rewards to a 0 value on validators we know the delegator has bond with
        rewards[bondDenom] = rewards[bondDenom] || 0

        commit(`setDelegationRewards`, { validatorAddr, rewards })
        commit(`setDistributionError`, null)
        state.loaded = true
      } catch (error) {
        Sentry.captureException(error)
        commit(`setDistributionError`, error)
      }
      state.loading = false
    },
    // TODO: move to a common parameters module
    async getDistributionParameters({ commit }) {
      state.loading = true
      try {
        const parameters = await node.get.distributionParameters()
        commit(`setDistributionParameters`, parameters)
        commit(`setDistributionError`, null)
        state.loaded = true
      } catch (error) {
        Sentry.captureException(error)
        commit(`setDistributionError`, error)
      }
      state.loading = false
    },
    async getOutstandingRewards({ commit }) {
      state.loading = true
      try {
        const oustandingRewardsArray = await node.get.distributionOutstandingRewards()
        const oustandingRewards = coinsToObject(oustandingRewardsArray)
        commit(`setOutstandingRewards`, oustandingRewards)
        commit(`setDistributionError`, null)
        state.loaded = true
      } catch (error) {
        Sentry.captureException(error)
        commit(`setDistributionError`, error)
      }
      state.loading = false
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
