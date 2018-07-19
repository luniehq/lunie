export default ({ node }) => {
  let state = {
    loading: false,

    // our delegations, maybe not yet committed
    delegates: [],

    // our delegations which are already on the blockchain
    committedDelegates: {}
  }

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
    setShares(state, { candidateId, value }) {
      state.delegates.find(c => c.id === candidateId).atoms = value
    },
    setCommittedDelegation(state, { candidateId, value }) {
      let committedDelegates = Object.assign({}, state.committedDelegates)
      if (value === 0) {
        delete committedDelegates[candidateId]
      } else {
        committedDelegates[candidateId] = value
      }
      state.committedDelegates = committedDelegates
    }
  }

  let actions = {
    reconnected({ state, dispatch }) {
      if (state.loading) {
        dispatch("getBondedDelegates")
      }
    },
    // load committed delegations from LCD
    async getBondedDelegates({ state, rootState, dispatch }, candidates) {
      state.loading = true
      let address = rootState.user.address
      candidates = candidates || (await dispatch("getDelegates"))
      await Promise.all(
        candidates.map(candidate =>
          dispatch("getBondedDelegate", {
            delegator: address,
            validator: candidate.owner
          })
        )
      )
      state.loading = false
    },
    // load committed delegation from LCD
    async getBondedDelegate({ commit, rootState }, { delegator, validator }) {
      let bond = await node.queryDelegation(delegator, validator)

      let shares = bond ? bond.shares : 0
      let delegate = rootState.delegates.delegates.find(
        d => d.owner === validator
      )

      commit("setCommittedDelegation", {
        candidateId: validator,
        value: shares
      })
      if (shares > 0) {
        commit("addToCart", delegate)
      }
    },
    async updateDelegates({ dispatch }) {
      let candidates = await dispatch("getDelegates")
      return dispatch("getBondedDelegates", candidates)
    },
    async submitDelegation(
      { rootState, state, dispatch, commit },
      delegations
    ) {
      let delegate = []
      let unbond = []
      for (let delegation of delegations) {
        let candidateId = delegation.delegate.owner
        let currentlyDelegated =
          parseInt(state.committedDelegates[candidateId]) || 0
        let amountChange = parseInt(delegation.atoms) - currentlyDelegated

        let isBond = amountChange > 0

        // skip if no change
        if (amountChange === 0) continue
        if (isBond) {
          delegate.push({
            delegator_addr: rootState.wallet.address,
            validator_addr: candidateId,
            delegation: {
              denom: rootState.config.bondingDenom,
              amount: String(amountChange)
            }
          })
        } else {
          unbond.push({
            delegator_addr: rootState.wallet.address,
            validator_addr: candidateId,
            // rational number
            shares: String(amountChange)
          })
        }
      }

      await dispatch("sendTx", {
        type: "updateDelegations",
        delegations: delegate,
        begin_unbondings: unbond
      })

      // usually I would just query the new state through the LCD but at this point we still get the old shares
      dispatch("updateDelegates").then(() => {
        for (let delegation of delegations) {
          commit("setCommittedDelegation", {
            candidateId: delegation.delegate.owner,
            value: delegation.atoms
          })
        }
      })
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
