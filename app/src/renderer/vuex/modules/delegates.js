"use strict"

import BN from "bignumber.js"
import { ratToBigNumber } from "scripts/common"
import { isEmpty } from "lodash"
export default ({ node }) => {
  const emptyState = {
    delegates: [],
    globalPower: null,
    loading: false
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setDelegateLoading(state, loading) {
      state.loading = loading
    },
    setDelegates(state, validators) {
      validators.forEach(validator => {
        validator.id = validator.owner
        validator.voting_power = ratToBigNumber(validator.tokens)
      })
      state.delegates = validators

      // update global power for quick access
      state.globalPower = state.delegates
        .reduce((sum, validator) => {
          return sum.plus(ratToBigNumber(validator.tokens))
        }, new BN(0))
        .toNumber()
    },
    setSelfBond(
      state,
      {
        validator: { owner },
        ratio
      }
    ) {
      state.delegates.find(
        validator => validator.owner === owner
      ).selfBond = ratio
    }
  }

  const actions = {
    async reconnected({ state, dispatch }) {
      if (state.loading) {
        await dispatch(`getDelegates`)
      }
    },
    resetSessionData({ rootState }) {
      rootState.delegates = JSON.parse(JSON.stringify(emptyState))
    },
    async updateSigningInfo({ commit }, validators) {
      for (let validator of validators) {
        let signing_info = await node.queryValidatorSigningInfo(
          validator.pub_key
        )
        if (!isEmpty(signing_info)) validator.signing_info = signing_info
      }
      commit(`setDelegates`, validators)
    },
    async getDelegates({ commit, dispatch }) {
      commit(`setDelegateLoading`, true)
      let validators = await node.getCandidates()
      let { validators: validatorSet } = await node.getValidatorSet()
      for (let validator of validators) {
        validator.isValidator = false
        if (validatorSet.find(v => v.pub_key === validator.pub_key)) {
          validator.isValidator = true
        }
      }

      commit(`setDelegates`, validators)
      commit(`setDelegateLoading`, false)
      dispatch(`getKeybaseIdentities`, validators)
      dispatch(`updateSigningInfo`, validators)

      return validators
    },
    async getSelfBond({ commit }, validator) {
      if (validator.selfBond) return validator.selfBond
      else {
        let delegation = await node.queryDelegation(
          validator.owner,
          validator.owner
        )
        let ratio = new BN(delegation.shares).div(
          ratToBigNumber(validator.delegator_shares)
        )

        commit(`setSelfBond`, { validator, ratio })
        return ratio
      }
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
