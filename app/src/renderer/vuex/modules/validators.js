import * as Sentry from "@sentry/browser"
import BN from "bignumber.js"
import { ratToBigNumber } from "scripts/common"
import num from "scripts/num"
import { isEmpty } from "lodash"
import b32 from "scripts/b32"

export default ({ node }) => {
  const emptyState = {
    globalPower: null,
    validators: [],
    validatorSet: [],
    validatorHash: null,
    loading: false,
    loaded: false,
    error: null
  }
  let state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setValidatorSet(state, validatorSet) {
      state.validators = validatorSet
    },
    setValidatorHash(state, validatorHash) {
      state.validatorHash = validatorHash
    },
    setValidatorLoading(state, loading) {
      state.loading = loading
    },
    setValidators(state, validators) {
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
      state.validators = validators
    },
    setSelfBond(
      state,
      {
        validator: { operator_address },
        ratio
      }
    ) {
      state.validators.find(
        validator => validator.operator_address === operator_address
      ).selfBond = ratio
    }
  }

  const actions = {
    async reconnected({ state, dispatch }) {
      if (state.loading) {
        await dispatch(`getValidators`)
        await dispatch(`getValidatorSet`)
      }
    },
    resetSessionData({ rootState }) {
      // clear previous account state
      rootState.validators = JSON.parse(JSON.stringify(emptyState))
    },
    async getValidatorSet({ state, commit, rootState }) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        let validators = (await node.getValidatorSet()).validators
        state.error = null
        state.loading = false
        state.loaded = true
        commit(`setValidatorSet`, validators)
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching validator set`,
          body: error.message
        })
        Sentry.captureException(error)
        state.error = error
      }
    },
    async getValidators({ commit, dispatch, rootState }) {
      commit(`setValidatorLoading`, true)

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

        commit(`setValidators`, validators)
        commit(`setValidatorLoading`, false)
        dispatch(`getKeybaseIdentities`, validators)
        dispatch(`updateSigningInfo`, validators)

        return validators
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching validators`,
          body: error.message
        })
        Sentry.captureException(error)
        commit(`setValidatorLoading`, false)
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
    },
    async maybeUpdateValidators({ state, commit, dispatch }, header) {
      let validatorHash = header.validators_hash
      if (validatorHash === state.validatorHash) return
      commit(`setValidatorHash`, validatorHash)
      await dispatch(`getValidators`)
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
      commit(`setValidators`, validators)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
