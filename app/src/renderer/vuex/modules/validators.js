import * as Sentry from "@sentry/browser"
import Vue from "vue"
import { coinsToObject } from "scripts/common.js"

export default ({ node }) => {
  const emptyState = {
    validators: [],
    loading: false,
    loaded: false,
    error: null,
    validatorHash: null,
    distributionInfo: {},
    rewards: {}
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setValidators(state, validators) {
      state.validators = validators
    },
    setValidatorHash(state, validatorHash) {
      state.validatorHash = validatorHash
    },
    setValidatorDistributionInfo(state, { validatorAddr, info }) {
      Vue.set(state.distributionInfo, validatorAddr, info)
    },
    setValidatorRewards(state, { validatorAddr, rewards }) {
      Vue.set(state.rewards, validatorAddr, rewards)
    }
  }

  const actions = {
    reconnected({ state, dispatch }) {
      if (state.loading) {
        dispatch(`getValidators`)
      }
    },
    resetSessionData({ rootState }) {
      // clear previous account state
      rootState.validators = JSON.parse(JSON.stringify(emptyState))
    },
    async getValidators({ state, commit, rootState }) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        const validators = (await node.getValidatorSet()).validators
        state.error = null
        state.loading = false
        state.loaded = true
        commit(`setValidators`, validators)
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching validator set`,
          body: error.message
        })
        Sentry.captureException(error)
        state.error = error
      }
    },
    async maybeUpdateValidators({ state, commit, dispatch }, header) {
      const validatorHash = header.validators_hash
      if (validatorHash === state.validatorHash) return
      commit(`setValidatorHash`, validatorHash)
      await dispatch(`getValidators`)
    },
    async getValidatorDistributionInfo({ commit }, validatorAddr) {
      state.loading = true
      try {
        let { self_bond_rewards, val_commission } =
          await node.getValidatorDistributionInformation(validatorAddr)
        self_bond_rewards = coinsToObject(self_bond_rewards)
        val_commission = coinsToObject(val_commission)
        const info = {
          self_bond_rewards, val_commission
        }
        commit(`setValidatorDistributionInfo`, {
          validatorAddr, info
        })
        state.error = null
        state.loaded = true
      } catch (error) {
        Sentry.captureException(error)
        state.error = error
      }
      state.loading = false
    },
    async getValidatorDistributionRewards({ commit }, validatorAddr) {
      state.loading = true
      try {
        const rewardsArray = await node.getValidatorRewards(validatorAddr)
        const rewards = coinsToObject(rewardsArray)
        commit(`setValidatorRewards`, {
          validatorAddr, rewards
        })
        state.error = null
        state.loaded = true
      } catch (error) {
        Sentry.captureException(error)
        state.error = error
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
