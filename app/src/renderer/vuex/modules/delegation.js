import * as Sentry from "@sentry/browser"
import { calculateShares } from "scripts/common"
import Vue from "vue"

export default ({ node }) => {
  let emptyState = {
    loading: false,
    loaded: false,
    error: null,

    // our delegations, maybe not yet committed
    validators: [],

    // our delegations which are already on the blockchain
    committedValidators: {},
    unbondingDelegations: {}
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    addToCart(state, validator) {
      // don't add to cart if already in cart
      for (let existingValidator of state.validators) {
        if (validator.id === existingValidator.id) return
      }

      state.validators.push({
        id: validator.id,
        validator: Object.assign({}, validator),
        atoms: 0
      })
    },
    removeFromCart(state, validator) {
      state.validators = state.validators.filter(c => c.id !== validator)
    },
    setCommittedDelegation(state, { candidateId, value }) {
      Vue.set(state.committedValidators, candidateId, value)
      if (value === 0) {
        delete state.committedValidators[candidateId]
        Vue.set(state, `committedValidators`, state.committedValidators)
      }
    },
    setUnbondingDelegations(state, unbondingDelegations) {
      state.unbondingDelegations = unbondingDelegations
        ? unbondingDelegations
            // building a dict from the array and taking out the transactions with amount 0
            .reduce(
              (dict, { validator_addr, ...delegation }) => ({
                ...dict,
                // filtering out the transactions with amount 0
                ...(delegation.balance.amount > 0 && {
                  [validator_addr]: delegation
                })
              }),
              {}
            )
        : {}
    }
  }
  let actions = {
    reconnected({ state, dispatch }) {
      if (state.loading) {
        dispatch(`getBondedValidators`)
      }
    },
    resetSessionData({ rootState }) {
      rootState.delegation = JSON.parse(JSON.stringify(emptyState))
    },
    // load committed delegations from LCD
    async getBondedValidators(
      { state, rootState, commit, dispatch },
      validators
    ) {
      state.loading = true

      if (!rootState.connection.connected) return

      let address = rootState.user.address
      validators = validators || (await dispatch(`getValidators`))

      try {
        let delegations = await node.getDelegations(address)
        let unbondingDelegations = await node.getUndelegations(address)
        let redelegations = await node.getRedelegations(address)
        let delegator = {
          delegations,
          unbondingDelegations,
          redelegations
        }
        state.error = null
        state.loading = false
        state.loaded = true

        // the request runs that long, that the user might sign out and back in again
        // the result is, that the new users state gets updated by the old users request
        // here we check if the user is still the same
        if (rootState.user.address !== address) return

        if (delegator.delegations) {
          delegator.delegations.forEach(({ validator_addr, shares }) => {
            commit(`setCommittedDelegation`, {
              candidateId: validator_addr,
              value: parseFloat(shares)
            })
            if (shares > 0) {
              const validator = validators.find(
                ({ operator_address }) => operator_address === validator_addr // this should change to address instead of operator_address
              )
              commit(`addToCart`, validator)
            }
          })
        }
        // delete delegations not present anymore
        Object.keys(state.committedValidators).forEach(validatorAddr => {
          if (
            !delegator.delegations ||
            !delegator.delegations.find(
              ({ validator_addr }) => validator_addr === validatorAddr
            )
          )
            commit(`setCommittedDelegation`, {
              candidateId: validatorAddr,
              value: 0
            })
        })

        commit(`setUnbondingDelegations`, unbondingDelegations)
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching delegations`,
          body: error.message
        })
        Sentry.captureException(error)
        state.error = error
      }

      state.loading = false
    },
    async updateValidators({ dispatch }) {
      let candidates = await dispatch(`getValidators`)
      return dispatch(`getBondedValidators`, candidates)
    },
    async submitDelegation(
      {
        rootState: { stakingParameters, user, wallet },
        state,
        dispatch,
        commit
      },
      { stakingTransactions, password }
    ) {
      const denom = stakingParameters.parameters.bond_denom
      const delegatorAddr = wallet.address
      // delegations = [], unbondings = [], redelegations = []

      const mappedDelegations =
        stakingTransactions.delegations &&
        stakingTransactions.delegations.map(({ atoms, validator }) => ({
          delegator_addr: delegatorAddr,
          validator_addr: validator.operator_address,
          delegation: {
            denom,
            amount: String(atoms)
          }
        }))

      const mappedUnbondings =
        stakingTransactions.unbondings &&
        stakingTransactions.unbondings.map(({ atoms, validator }) => ({
          delegator_addr: delegatorAddr,
          validator_addr: validator.operator_address,
          shares: String(
            Math.abs(calculateShares(validator, atoms)).toFixed(10)
          ) // TODO change to 10 when available https://github.com/cosmos/cosmos-sdk/issues/2317
        }))

      const mappedRedelegations =
        stakingTransactions.redelegations &&
        stakingTransactions.redelegations.map(
          ({ atoms, validatorSrc, validatorDst }) => ({
            delegator_addr: delegatorAddr,
            validator_src_addr: validatorSrc.operator_address,
            validator_dst_addr: validatorDst.operator_address,
            shares: String(
              calculateShares(validatorSrc, atoms)
                .multipliedBy(10000000000)
                .toFixed(10)
            )
          })
        )

      await dispatch(`sendTx`, {
        type: `updateDelegations`,
        to: wallet.address, // TODO strange syntax
        delegations: mappedDelegations,
        begin_unbondings: mappedUnbondings,
        begin_redelegates: mappedRedelegations,
        password
      })

      if (mappedDelegations) {
        // (optimistic update) we update the atoms of the user before we get the new values from chain

        let atomsSum = stakingTransactions.delegations.reduce(
          (sum, delegation) => sum + delegation.atoms,
          0
        )
        commit(`setAtoms`, user.atoms - atomsSum)

        // optimistically update the committed delegations
        stakingTransactions.delegations.forEach(delegation => {
          state.committedValidators[delegation.validator.operator_address] +=
            delegation.atoms
        })
      }

      // we optimistically update the committed delegations
      // TODO usually I would just query the new state through the LCD and update the state with the result, but at this point we still get the old shares
      setTimeout(async () => {
        dispatch(`updateValidators`)
      }, 5000)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
