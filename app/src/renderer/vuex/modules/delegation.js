import * as Sentry from "@sentry/browser"
import Vue from "vue"
import { calculateShares } from "scripts/common"

export default ({ node }) => {
  const emptyState = {
    loading: false,
    loaded: false,
    error: null,

    // our delegations, maybe not yet committed
    delegates: [],

    // our delegations which are already on the blockchain
    committedDelegates: {},
    unbondingDelegations: {}
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    addToCart(state, delegate) {
      // don't add to cart if already in cart
      for (const existingDelegate of state.delegates) {
        if (delegate.id === existingDelegate.id) return
      }

      state.delegates.push({
        id: delegate.id,
        delegate: Object.assign({}, delegate),
        atoms: 0
      })
    },
    removeFromCart(state, delegate) {
      state.delegates = state.delegates.filter(c => c.id !== delegate)
    },
    setCommittedDelegation(state, { candidateId, value }) {
      Vue.set(state.committedDelegates, candidateId, value)
      if (value === 0) {
        delete state.committedDelegates[candidateId]
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
  const actions = {
    reconnected({ state, dispatch, rootState }) {
      if (state.loading && rootState.session.signedIn) {
        dispatch(`getBondedDelegates`)
      }
    },
    resetSessionData({ rootState }) {
      rootState.delegation = JSON.parse(JSON.stringify(emptyState))
    },
    // load committed delegations from LCD
    async getBondedDelegates(
        { state, rootState, commit },
        candidates
    ) {
      state.loading = true

      if (!rootState.connection.connected) return

      const address = rootState.session.address

      try {
        const delegations = await node.getDelegations(address)
        const unbondingDelegations = await node.getUndelegations(address)
        const redelegations = await node.getRedelegations(address)
        const delegator = {
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
        if (rootState.session.address !== address) return

        if (delegator.delegations && candidates) {
          delegator.delegations.forEach(({ validator_addr, shares }) => {
            commit(`setCommittedDelegation`, {
              candidateId: validator_addr,
              value: parseFloat(shares)
            })
            if (shares > 0) {
              const delegate = candidates.find(
                ({ operator_address }) => operator_address === validator_addr // this should change to address instead of operator_address
              )
              commit(`addToCart`, delegate)
            }
          })
        }
        // delete delegations not present anymore
        Object.keys(state.committedDelegates).forEach(validatorAddr => {
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
    async updateDelegates({ dispatch, rootState }) {
      const candidates = await dispatch(`getDelegates`)

      if(rootState.session.signedIn) {
        dispatch(`getBondedDelegates`, candidates)
      }
    },
    async submitDelegation(
        {
          rootState: { stakingParameters, wallet },
          getters: { liquidAtoms },
          state,
          dispatch,
          commit
        },
        { validator_addr, amount, password, submitType }
    ) {
      const denom = stakingParameters.parameters.bond_denom
      const delegation = {
        denom,
        amount: String(amount)
      }

      await dispatch(`sendTx`, {
        type: `postDelegation`,
        to: wallet.address, // TODO strange syntax
        password,
        submitType,
        delegator_addr: wallet.address,
        validator_addr,
        delegation
      })

      // optimistic update the atoms of the user before we get the new values from chain
      commit(`updateWalletBalance`, {
        denom,
        amount: Number(liquidAtoms) - Number(amount)
      })
      // optimistically update the committed delegations
      commit(`setCommittedDelegation`, {
        candidateId: validator_addr,
        value: state.committedDelegates[validator_addr] + Number(amount)
      })

      // load delegates after delegation to get new atom distribution on validators
      dispatch(`updateDelegates`)
    },
    async submitUnbondingDelegation(
        {
          rootState: { wallet },
          dispatch
        },
        { validator, amount, password, submitType }
    ) {
      // TODO: change to 10 when available https://github.com/cosmos/cosmos-sdk/issues/2317
      const shares = String(
        Math.abs(calculateShares(validator, amount)).toFixed(10)
      )
      await dispatch(`sendTx`, {
        type: `postUnbondingDelegation`,
        to: wallet.address,
        delegator_addr: wallet.address,
        validator_addr: validator.operator_address,
        shares,
        password,
        submitType
      })
    },
    async submitRedelegation(
        {
          rootState: { wallet },
          dispatch
        },
        { validatorSrc, validatorDst, amount, password, submitType }
    ) {
      const shares = String(
        Math.abs(calculateShares(validatorSrc, amount)).toFixed(10)
      )

      await dispatch(`sendTx`, {
        type: `postRedelegation`,
        to: wallet.address,
        delegator_addr: wallet.address,
        validator_src_addr: validatorSrc.operator_address,
        validator_dst_addr: validatorDst.operator_address,
        shares,
        password,
        submitType
      })
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
