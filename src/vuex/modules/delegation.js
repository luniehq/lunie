import * as Sentry from "@sentry/browser"
import Vue from "vue"

export default ({ node }) => {
  const emptyState = {
    loading: false,
    loaded: false,
    error: null,

    // our delegations, maybe not yet committed
    lastDelegatesUpdate: 0,

    // our delegations which are already on the blockchain
    committedDelegates: {},
    unbondingDelegations: {}
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setCommittedDelegation(state, { candidateId, value }) {
      Vue.set(state.committedDelegates, candidateId, value)
      if (value === 0) {
        delete state.committedDelegates[candidateId]
      }
    },
    setUnbondingDelegations(state, unbondingDelegations) {
      state.unbondingDelegations = unbondingDelegations
        ? unbondingDelegations
            // building a dict from the array and taking out the validators with no undelegations
            .reduce(
              (dict, { validator_address, entries }) => ({
                ...dict,
                [validator_address]: entries.length > 0 ? entries : undefined
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
    async initializeWallet({ dispatch }) {
      await dispatch(`updateDelegates`)
    },
    // load committed delegations from LCD
    async getBondedDelegates({ state, rootState, commit }, candidates) {
      state.loading = true

      if (!rootState.connection.connected) return

      const address = rootState.session.address

      try {
        const delegations = await node.get.delegations(address)
        const unbondingDelegations = await node.get.undelegations(address)
        const redelegations = await node.get.redelegations(address)
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
          delegator.delegations.forEach(({ validator_address, shares }) => {
            commit(`setCommittedDelegation`, {
              candidateId: validator_address,
              value: parseFloat(shares)
            })
          })
        }
        // delete delegations not present anymore
        Object.keys(state.committedDelegates).forEach(validatorAddr => {
          if (
            !delegator.delegations ||
            !delegator.delegations.find(
              ({ validator_address }) => validator_address === validatorAddr
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
    async updateDelegates({ dispatch, rootState, state }, force = false) {
      // only update every 10 blocks
      if (
        !force &&
        Number(rootState.connection.lastHeader.height) -
          state.lastDelegatesUpdate <
          5
      ) {
        return
      }
      state.lastDelegatesUpdate = Number(rootState.connection.lastHeader.height)
      const candidates = await dispatch(`getDelegates`)

      if (rootState.session.signedIn) {
        dispatch(`getBondedDelegates`, candidates)
      }
    },
    async simulateDelegation(
      {
        rootState: { stakingParameters, session },
        dispatch
      },
      { validator_address, amount }
    ) {
      const denom = stakingParameters.parameters.bond_denom

      return await dispatch(`simulateTx`, {
        type: `MsgDelegate`,
        txArguments: {
          toAddress: session.address,
          delegator_address: session.address,
          validator_address,
          amount,
          denom
        }
      })
    },
    async submitDelegation(
      {
        rootState: { stakingParameters, session },
        dispatch
      },
      { validator_address, amount, gas, gas_prices, password, submitType }
    ) {
      const denom = stakingParameters.parameters.bond_denom

      await dispatch(`sendTx`, {
        type: `MsgDelegate`,
        txArguments: {
          toAddress: session.address,
          delegator_address: session.address,
          validator_address,
          amount,
          denom
        },
        gas,
        gas_prices,
        password,
        submitType
      })
    },
    async simulateUnbondingDelegation(
      {
        rootState: { stakingParameters, session },
        dispatch
      },
      { validator, amount }
    ) {
      const denom = stakingParameters.parameters.bond_denom
      return await dispatch(`simulateTx`, {
        type: `MsgUndelegate`,
        txArguments: {
          toAddress: session.address,
          delegator_address: session.address,
          validator_address: validator.operator_address,
          denom,
          amount
        }
      })
    },
    async submitUnbondingDelegation(
      {
        rootState: { stakingParameters, session },
        dispatch
      },
      { validator, amount, gas, gas_prices, password, submitType }
    ) {
      const denom = stakingParameters.parameters.bond_denom
      await dispatch(`sendTx`, {
        type: `MsgUndelegate`,
        txArguments: {
          toAddress: session.address,
          delegator_address: session.address,
          validator_address: validator.operator_address,
          amount,
          denom
        },
        gas,
        gas_prices,
        password,
        submitType
      })
    },
    async simulateRedelegation(
      {
        rootState: { stakingParameters, session },
        dispatch
      },
      { validatorSrc, validatorDst, amount }
    ) {
      const denom = stakingParameters.parameters.bond_denom
      return await dispatch(`simulateTx`, {
        type: `MsgRedelegate`,
        txArguments: {
          toAddress: session.address,
          delegator_address: session.address,
          validator_src_address: validatorSrc.operator_address,
          validator_dst_address: validatorDst.operator_address,
          amount,
          denom
        }
      })
    },
    async submitRedelegation(
      {
        rootState: { stakingParameters, session },
        dispatch
      },
      {
        validatorSrc,
        validatorDst,
        amount,
        gas,
        gas_prices,
        password,
        submitType
      }
    ) {
      const denom = stakingParameters.parameters.bond_denom

      await dispatch(`sendTx`, {
        type: `MsgRedelegate`,
        txArguments: {
          toAddress: session.address,
          delegator_address: session.address,
          validator_src_address: validatorSrc.operator_address,
          validator_dst_address: validatorDst.operator_address,
          amount,
          denom
        },
        gas,
        gas_prices,
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
