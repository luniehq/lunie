import Raven from "raven-js"
import BN from "bignumber.js"
import { ratToBigNumber } from "scripts/common"
import num from "scripts/num"
import { isEmpty } from "lodash"
import b32 from "scripts/b32"

export default ({ node }) => {
  const emptyState = {
    delegates: [],
    globalPower: null,
    loading: false,
    loaded: false,
    error: null
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
        if (validator.consensus_pubkey) {
          let signing_info = await node.queryValidatorSigningInfo(
            validator.consensus_pubkey
          )
          if (!isEmpty(signing_info)) validator.signing_info = signing_info
        }
      }
      commit(`setDelegates`, validators)
    },
    async getDelegates({ commit, dispatch, rootState }) {
      commit(`setDelegateLoading`, true)

      if (!rootState.connection.connected) return

      try {
        let validators = await node.getCandidates()
        let { validators: validatorSet } = await node.getValidatorSet()
        state.error = null
        state.loading = false
        state.loaded = true

        for (let validator of validators) {
          validator.isValidator = false
          if (validatorSet.find(v => v.pub_key === validator.pub_key)) {
            validator.isValidator = true
          }
        }
        // the tokens and shares are currently served in a weird format that is a amino representation of a float value
        validators = validators.map(validator => {
          return Object.assign(JSON.parse(JSON.stringify(validator)), {
            tokens: validator.tokens,
            delegator_shares: validator.delegator_shares
          })
        })

        commit(`setDelegates`, validators)
        commit(`setDelegateLoading`, false)
        dispatch(`getKeybaseIdentities`, validators)
        dispatch(`updateSigningInfo`, validators)

        return validators
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching validators`,
          body: error.message
        })
        Raven.captureException(error)
        commit(`setDelegateLoading`, false)
        state.error = error
        return []
      }
    },
    async getSelfBond({ commit }, validator) {
      if (validator.selfBond) return validator.selfBond
      else {
        let hexAddr = b32.decode(validator.operator_address)
        let operatorCosmosAddr = b32.encode(hexAddr, `cosmos`)
        let delegation = await node.queryDelegation(
          operatorCosmosAddr,
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
