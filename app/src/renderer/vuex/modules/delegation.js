import Raven from "raven-js"
import { calculateShares } from "scripts/common"

export default ({ node }) => {
  let emptyState = {
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
      for (let existingDelegate of state.delegates) {
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
      let committedDelegates = Object.assign({}, state.committedDelegates)
      if (value === 0) {
        delete committedDelegates[candidateId]
      } else {
        committedDelegates[candidateId] = value
      }
      state.committedDelegates = committedDelegates
    },
    setUnbondingDelegations(
      state,
      { validator_addr, min_time, balance, creation_height }
    ) {
      let unbondingDelegations = Object.assign({}, state.unbondingDelegations)
      if (balance.amount === 0) {
        delete unbondingDelegations[validator_addr]
      } else {
        unbondingDelegations[validator_addr] = {
          min_time,
          balance,
          creation_height
        }
      }
      state.unbondingDelegations = unbondingDelegations
    }
  }

  let actions = {
    reconnected({ state, dispatch }) {
      if (state.loading) {
        dispatch(`getBondedDelegates`)
      }
    },
    resetSessionData({ rootState }) {
      rootState.delegation = JSON.parse(JSON.stringify(emptyState))
    },
    // load committed delegations from LCD
    async getBondedDelegates(
      { state, rootState, commit, dispatch },
      candidates
    ) {
      state.loading = true

      if (!rootState.connection.connected) return

      let address = rootState.user.address
      candidates = candidates || (await dispatch(`getDelegates`))

      try {
        let delegations = await node.getDelegations(address)
        let unbonding_delegations = await node.getUndelegations(address)
        let redelegations = await node.getRedelegations(address)
        let delegator = {
          delegations,
          unbonding_delegations,
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

        if (delegator.unbonding_delegations) {
          delegator.unbonding_delegations.forEach(ubd => {
            commit(`setUnbondingDelegations`, ubd)
          })
        }
        // delete undelegations not present anymore
        Object.keys(state.unbondingDelegations).forEach(validatorAddr => {
          if (
            !delegator.unbonding_delegations ||
            !delegator.unbonding_delegations.find(
              ({ validator_addr }) => validator_addr === validatorAddr
            )
          )
            commit(`setUnbondingDelegations`, {
              validator_addr: validatorAddr,
              balance: { amount: 0 }
            })
        })
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching delegations`,
          body: error.message
        })
        Raven.captureException(error)
        state.error = error
      }

      state.loading = false
    },
    async updateDelegates({ dispatch }) {
      let candidates = await dispatch(`getDelegates`)
      return dispatch(`getBondedDelegates`, candidates)
    },
    async submitDelegation(
      {
        rootState: { config, user, wallet },
        state,
        dispatch,
        commit
      },
      { stakingTransactions, password }
    ) {
      const denom = config.bondingDenom.toLowerCase()
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
          state.committedDelegates[delegation.validator.operator_address] +=
            delegation.atoms
        })
      }

      // we optimistically update the committed delegations
      // TODO usually I would just query the new state through the LCD and update the state with the result, but at this point we still get the old shares
      setTimeout(async () => {
        dispatch(`updateDelegates`)
      }, 5000)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
