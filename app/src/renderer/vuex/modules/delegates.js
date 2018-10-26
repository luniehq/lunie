"use strict"

import BN from "bignumber.js"
import { ratToBigNumber } from "scripts/common"
import num from "scripts/num"
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
      // update global power for quick access
      state.globalPower = validators
        .reduce((sum, validator) => {
          return sum.plus(ratToBigNumber(validator.tokens))
        }, new BN(0))
        .toNumber()

      validators.forEach(validator => {
        validator.id = validator.operator_address
        validator.voting_power = ratToBigNumber(validator.tokens)
        validator.percent_of_vote = num.percent(
          validator.voting_power / state.globalPower
        )
      })
      state.delegates = validators
    },
    setSelfBond(
      state,
      {
        validator: { operator_address },
        ratio
      }
    ) {
      state.delegates.find(
        validator => validator.operator_address === operator_address
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
          validator.consensus_pubkey
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
      // the tokens and shares are currently served in a weird format that is a amino representation of a float value
      validators = validators.map(validator => {
        return Object.assign(JSON.parse(JSON.stringify(validator)), {
          tokens: ratToBigNumber(validator.tokens)
            .div(10000000000)
            .toString(),
          delegator_shares: ratToBigNumber(validator.delegator_shares)
            .div(10000000000)
            .toString()
        })
      })

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
          validator.operator_address,
          validator.operator_address
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
