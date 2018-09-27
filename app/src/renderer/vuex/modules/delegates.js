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
      state.delegates = delegates

      // update global power for quick access
      state.globalPower = state.delegates
        .reduce((sum, validator) => {
          return sum.plus(ratToBigNumber(validator.tokens))
        }, new BN(0))
        .toNumber()
    },
    addDelegate(state, delegate) {
      delegate.id = delegate.owner

      // TODO: calculate voting power
      let divIdx = delegate.tokens.indexOf(`/`)
      let tokens
      if (divIdx == -1) {
        tokens = Number(delegate.tokens)
      } else {
        tokens =
          Number(delegate.tokens.substring(0, divIdx)) /
          Number(delegate.tokens.substring(divIdx + 1))
      }
      delegate.voting_power = tokens.toFixed(2)

      // update if we already have this delegate
      for (let existingDelegate of state.delegates) {
        if (existingDelegate.id === delegate.id) {
          Object.assign(existingDelegate, delegate)
          return
        }
      }

      state.delegates.push(delegate)
    }
  }

  const actions = {
    reconnected({ state, dispatch }) {
      if (state.loading) {
        dispatch(`getDelegates`)
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
        commit(`addDelegate`, validator)
      }
    },
    async getDelegates({ state, commit, dispatch }) {
      commit(`setDelegateLoading`, true)
      let candidates = await node.getCandidates()
      let { validators } = await node.getValidatorSet()
      for (let delegate of candidates) {
        delegate.isValidator = false
        if (validators.find(v => v.pub_key === delegate.pub_key)) {
          delegate.isValidator = true
        }
        commit(`addDelegate`, delegate)
      }

      commit(`setDelegates`, candidates)
      commit(`setDelegateLoading`, false)
      dispatch(`getKeybaseIdentities`, candidates)
      dispatch(`updateSigningInfo`, candidates)

      return state.delegates
    },
    async getSelfBond({ commit }, validator) {
      if (validator.selfBond) return validator.selfBond
      else {
        let delegation = await node.queryDelegation(
          validator.owner,
          validator.owner
        )
        let ratio = new BN(delegation.shares)
          .div(ratToBigNumber(validator.delegator_shares))
          .toNumber()

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
