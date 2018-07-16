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

      let shares = bond ? parseRat(bond.shares) : 0
      let delegate = rootState.delegates.delegates.find(
        d => d.owner === validator
      )
      let tokens = parseRat(delegate.pool_shares.amount)
      let totalShares = parseRat(delegate.delegator_shares)
      let tokensPerShare = totalShares ? tokens / totalShares : 0

      let value = tokensPerShare * shares
      commit("setCommittedDelegation", {
        candidateId: validator,
        value
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
        let currentlyDelegated = state.committedDelegates[candidateId] || 0
        let amountChange = delegation.atoms - currentlyDelegated

        let isBond = amountChange > 0

        // skip if no change
        if (amountChange === 0) continue
        if (isBond) {
          delegate.push({
            delegator_addr: rootState.wallet.address,
            validator_addr: candidateId,
            bond: {
              denom: rootState.config.bondingDenom,
              amount: amountChange
            }
          })
        } else {
          // convert tokens to shares
          let sharesPerToken =
            parseRat(delegation.delegate.delegator_shares) /
            parseRat(delegation.delegate.pool_shares.amount)
          let value = Math.abs(amountChange) * sharesPerToken

          unbond.push({
            delegator_addr: rootState.wallet.address,
            validator_addr: candidateId,
            // rational number
            shares: String(value)
          })
        }
      }

      await dispatch("sendTx", {
        type: "updateDelegations",
        delegate,
        unbond
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

// parse sdk rational number string
function parseRat(ratStr = "") {
  let [numerator, denominator] = ratStr.split("/")
  if (!denominator) return +numerator
  return +numerator / +denominator
}
