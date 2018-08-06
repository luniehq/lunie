export default ({ node }) => {
  const state = {
    validators: [],
    loading: false,
    subscription: false,
    validatorHash: null
  }

  const mutations = {
    setValidators(state, validators) {
      state.validators = validators
    },
    updateValidator(state, index, updatedValidator) {
      state.validators[index] = updatedValidator
    },
    addValidator(state, validator) {
      state.validators.push(validator)
    },
    setValidatorHash(state, validatorHash) {
      state.validatorHash = validatorHash
    }
  }

  const actions = {
    reconnected({ state, dispatch }) {
      if (state.loading) {
        dispatch("getValidators")
      }
    },
    getValidators({ state, commit }) {
      state.loading = true
      node.rpc.validators((err, { validators } = {}) => {
        if (err) {
          commit("notifyError", {
            title: "Error fetching validator set",
            body: err.message
          })
          return
        }
        commit("setValidators", validators)
        state.loading = false
      })
    },
    maybeUpdateValidators({ state, commit, dispatch }, header) {
      let validatorHash = header.validators_hash
      if (validatorHash === state.validatorHash) return
      commit("setValidatorHash", validatorHash)
      dispatch("getValidators")
    },
    validatorUpdateSubscribe({ state, commit, dispatch }) {
      // Return if already subscribed to updates
      if (state.subscription) return

      // TODO move to common file since subscribeToBlock also uses it
      function error(err) {
        if (err.data === "already subscribed") {
          console.error("Tryed to subscribe to an already subscribed rpc event")
          return
        }
        dispatch("nodeHasHalted")
        console.error(
          `Error subscribing to new validator set updates: ${
            err.message
          } ${err.data || ""}`
        )
      }
      node.rpc.subscribe(
        { query: "tm.event = 'ValidatorSetUpdates'" },
        (err, event) => {
          if (err) return error(err)
          // https://github.com/tendermint/tendermint/pull/2161/files#diff-76d6626766e8d862e9acb34c166664b5
          for (var validator in event.data.value.validator_updates) {
            if (validator.power == 0) {
              let dumpedValIdx = state.validators.findIndex(
                v => v.pubkey == validator.pubkey
              )
              commit("updateValidator", dumpedValIdx, validator)
            } else {
              commit("addValidator", validator)
            }
          }
        }
      )
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
