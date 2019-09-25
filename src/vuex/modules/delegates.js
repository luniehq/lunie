import BN from "bignumber.js"
import b32 from "scripts/b32"
import Vue from "vue"
import { throttle } from "scripts/blocks-throttle"

export default ({ node }) => {
  const emptyState = {
    delegates: [],
    loading: false,
    loaded: false,
    error: null,
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
    }
  }

  const actions = {
    reconnected({ state, dispatch }) {
      if (state.loading) {
        dispatch(`getDelegates`)
      }
    },
    async getDelegates({ state, commit, rootState }) {
      commit(`setDelegateLoading`, true)

      if (!rootState.connection.connected) return

      try {
        let validators = await node.get.validators()
        state.error = null
        state.loading = false
        state.loaded = true

        commit(`setDelegates`, validators)
        commit(`setDelegateLoading`, false)

        return validators
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching validators`,
          body: error.message
        })
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
        const delegations = await node.get.delegations(operatorCosmosAddr)
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
