import * as Sentry from "@sentry/browser"
import Vue from "vue"
import { coinsToObject } from "scripts/common.js"

export default ({ node }) => {
  const emptyState = {
    loading: false,
    loaded: false,
    error: null,
    /* totalRewards use the following format:
        { 
            denom1: amount1,
            ... ,
            denomN: amountN 
        }
    */
    totalRewards: {},
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
    setTotalRewards(state, rewards) {
      state.totalRewards = rewards
    },
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
        await dispatch(`getTotalRewards`)
      }
    },
    resetSessionData({ rootState }) {
      rootState.distribution = JSON.parse(JSON.stringify(emptyState))
    },
    async getTotalRewards(
      { state, rootState: { session }, commit }
    ) {
      state.loading = true
      try {
        const rewardsArray = await node.getDelegatorRewards(session.address)
        const rewards = coinsToObject(rewardsArray)
        commit(`setTotalRewards`, rewards)
        commit(`setDistributionError`, null)
        state.loaded = true
      } catch (error) {
        Sentry.captureException(error)
        commit(`setDistributionError`, error)
      }
      state.loading = false
    },
    async withdrawAllRewards(
      { rootState: { wallet }, dispatch },
      { password, submitType }
    ) {
      await dispatch(`sendTx`, {
        type: `postWithdrawDelegatorRewards`,
        to: wallet.address,
        password,
        submitType
      })
      await dispatch(`getTotalRewards`)
    },
    async getRewardsFromAllValidators({ state, dispatch }, validators) {
      state.loading = true
      await Promise.all(validators.map(validator =>
        dispatch(`getRewardsFromValidator`, validator.operator_address)
      ))
      state.loading = false
      state.loaded = true
    },
    async getRewardsFromValidator({ state, rootState: { session }, commit }, validatorAddr) {
      state.loading = true
      try {
        const rewardsArray = await node.getDelegatorRewardsFromValidator(session.address, validatorAddr)
        const rewards = coinsToObject(rewardsArray)
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
        const parameters = await node.getDistributionParameters()
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
        const oustandingRewardsArray = await node.getDistributionOutstandingRewards()
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
