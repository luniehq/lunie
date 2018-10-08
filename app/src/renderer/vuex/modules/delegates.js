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
    setDelegates(state, delegates) {
      state.delegates = delegates.map(delegate => {
        delegate.id = delegate.owner
        delegate.voting_power = ratToBigNumber(delegate.tokens)

        return delegate
      })

      // update global power for quick access
      state.globalPower = state.delegates
        .reduce((sum, validator) => {
          return sum.plus(ratToBigNumber(validator.tokens))
        }, new BN(0))
        .toNumber()
    },
    setSelfBond(state, { validator, ratio }) {
      state.delegates.find(c => c.owner === validator.owner).selfBond = ratio
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
      let candidates = await node.getCandidates()
      let { validators } = await node.getValidatorSet()
      for (let delegate of candidates) {
        delegate.isValidator = false
        if (validators.find(v => v.pub_key === delegate.pub_key)) {
          delegate.isValidator = true
        }
      }

      commit(`setDelegates`, candidates)
      commit(`setDelegateLoading`, false)
      dispatch(`getKeybaseIdentities`, candidates)
      dispatch(`updateSigningInfo`, candidates)

      return candidates
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
