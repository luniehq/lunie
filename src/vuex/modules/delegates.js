import * as Sentry from "@sentry/browser"
import BN from "bignumber.js"
import { ratToBigNumber } from "scripts/common"
import num from "scripts/num"
import b32 from "scripts/b32"
import Vue from "vue"

export default ({ node }) => {
  const emptyState = {
    delegates: [],
    globalPower: null,
    loading: false,
    loaded: false,
    error: null,
    lastValidatorsUpdate: 0,
    signingInfos: {}
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

        upsertValidator(state, validator)
      })
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
    },
    setSigningInfos(state, signingInfos) {
      state.signingInfos = signingInfos
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
    async updateSigningInfo(
      {
        commit,
        getters: { lastHeader }
      },
      validators
    ) {
      // throttle the update for validators for every 10 blocks
      const waited10Blocks =
        Number(lastHeader.height) - state.lastDelegatesUpdate >= 10
      if (state.lastValidatorsUpdate !== 0 && !waited10Blocks) {
        return
      }

      state.lastValidatorsUpdate = Number(lastHeader.height)
      const signingInfos = await Promise.all(
        validators.map(async validator => {
          if (validator.consensus_pubkey) {
            const signing_info = await node.get.validatorSigningInfo(
              validator.consensus_pubkey
            )
            return {
              operator_address: validator.operator_address,
              signing_info
            }
          }
        })
      )
      commit(
        `setSigningInfos`,
        signingInfos
          .filter(x => !!x)
          .reduce(
            (signingInfos, { operator_address, signing_info }) => ({
              ...signingInfos,
              [operator_address]: signing_info
            }),
            {}
          )
      )
    },
    async getDelegates({ state, commit, dispatch, rootState }) {
      commit(`setDelegateLoading`, true)

      if (!rootState.connection.connected) return

      try {
        let validators = await node.get.validators()
        state.error = null
        state.loading = false
        state.loaded = true

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
        Sentry.captureException(error)
        state.error = error
        return []
      }
    },
    async getSelfBond({ commit }, validator) {
      if (validator.selfBond) return validator.selfBond
      else {
        const hexAddr = b32.decode(validator.operator_address)
        const operatorCosmosAddr = b32.encode(hexAddr, `cosmos`)
        const delegation = await node.get.delegation(
          operatorCosmosAddr,
          validator.operator_address
        )
        const ratio = new BN(delegation.shares).div(
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

// incrementally add the validator to the list or update it in place
// "upsert": (computing, databases) An operation that inserts rows into a database table if they do not already exist, or updates them if they do.
function upsertValidator(state, validator) {
  const oldValidatorIndex = state.delegates.findIndex(
    oldValidator => oldValidator.operator_address === validator.operator_address
  )
  if (oldValidatorIndex === -1) {
    state.delegates.push(validator)
    return
  }
  Vue.set(
    state.delegates,
    oldValidatorIndex,
    Object.assign({}, state.delegates[oldValidatorIndex], validator)
  )
}
