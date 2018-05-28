export default ({ commit, node }) => {
  let state = {
    loading: false,
    delegationActive: false,

    // our delegations, maybe not yet committed
    delegates: [],

    // our delegations which are already on the blockchain
    committedDelegates: {}
  }

  const mutations = {
    activateDelegation(state) {
      state.delegationActive = true
    },
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
    async getBondedDelegate({ commit }, { delegator, validator }) {
      let bond = await node.queryDelegation(delegator, validator)
      commit("setCommittedDelegation", {
        candidateId: validator,
        value: bond ? parseRat(bond.shares) : 0
      })
    },
    submitDelegation({ rootState, state, dispatch }, delegations) {
      let delegate = []
      let unbond = []
      for (let delegation of delegations.delegates) {
        let candidateId = delegation.delegate.owner
        let currentlyDelegated = state.committedDelegates[candidateId] || 0
        let amountChange = delegation.atoms - currentlyDelegated
        let isBond = amountChange > 0

        // skip if no change
        if (amountChange === 0) return null

        // bonding takes a 'coin' object, unbond takes a rational number
        let amount
        if (amountChange > 0) {
        } else {
          amount = Math.abs(amountChange) + "/1"
        }

        if (isBond) {
          delegate.push({
            delegator_addr: rootState.wallet.address,
            validator_addr: candidateId,
            // TODO: figure out which denom is bonding denom
            bond: {
              denom: "steak",
              amount: Math.abs(amountChange)
            }
          })
        } else {
          unbond.push({
            delegator_addr: rootState.wallet.address,
            validator_addr: candidateId,
            // rational number
            shares: Math.abs(amountChange) + "/1"
          })
        }
      }

      return dispatch("sendTx", {
        type: "updateDelegations",
        delegate,
        unbond
      })
    }
  }

  return {
    state,
    mutations,
    actions
  }
}

// parse sdk rational number string
function parseRat(ratStr) {
  let [numerator, denominator] = ratStr.split("/")
  return +numerator / +denominator
}
