import * as Sentry from "@sentry/browser"
import BN from "bignumber.js"
import b32 from "scripts/b32"
import Vue from "vue"

export default ({ node }) => {
  const emptyState = {
    delegates: [],
    loading: false,
    loaded: false,
    error: null,
    lastValidatorsUpdate: 0,
    signingInfos: {},
    selfBond: {}
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setDelegateLoading(state, loading) {
      state.loading = loading
    },
    setDelegates(state, validators) {
      validators.forEach(validator => {
        upsertValidator(state, validator)
      })
      // filter not existing once out
      state.delegates = state.delegates.filter(validator =>
        validators.find(
          ({ operator_address }) =>
            validator.operator_address === operator_address
        )
      )
    },
    setSelfBond(
      state,
      {
        validator: { operator_address },
        ratio
      }
    ) {
      Vue.set(state.selfBond, operator_address, ratio)
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
            const signing_info = await node.getValidatorSigningInfo(
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
        let validators = await node.getValidators()
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
    async getSelfBond({ commit, state }, validator) {
      if (state.selfBond[validator.operator_address])
        return state.selfBond[validator.operator_address]
      else {
        const hexAddr = b32.decode(validator.operator_address)
        const operatorCosmosAddr = b32.encode(hexAddr, `cosmos`)
        const delegations = await node.getDelegations(operatorCosmosAddr)
        const delegation = delegations.filter(
          ({ validator_address }) =>
            validator.operator_address === validator_address
        )[0]
        const ratio = new BN(delegation.shares).div(validator.delegator_shares)

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
