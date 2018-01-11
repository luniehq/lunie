import axios from 'axios'

export default ({ commit }) => {
  let state = {
    // our delegations, maybe not yet committed
    delegates: [],

    // our delegations which are already on the blockchain
    committedDelegates: {}
  }

  const mutations = {
    addToCart (state, delegate) {
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
    removeFromCart (state, delegate) {
      state.delegates = state.delegates.filter(c => c.id !== delegate)
    },
    setShares (state, {candidateId, value}) {
      state.delegates.find(c => c.id === candidateId).atoms = value
    },
    setCommittedDelegation (state, {candidateId, value}) {
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
    // load committed delegations from LCD
    async getBondedDelegates ({ state, dispatch }, {candidates, address}) {
      candidates.forEach(candidate => {
        dispatch('getBondedDelegate', {address, pubkey: candidate.pub_key.data})
      })
    },
    // load committed delegation from LCD
    async getBondedDelegate ({ commit }, {address, pubkey}) {
      // TODO move into cosmos-sdk
      let bond = (await axios.get('http://localhost:8998/query/stake/delegator/' + address + '/' + pubkey)).data.data
      commit('setCommittedDelegation', {candidateId: bond.PubKey.data, value: bond.Shares})
    },
    async walletDelegate ({ dispatch }, args) {
      args.type = 'buildDelegate'
      await dispatch('walletTx', args)
    },
    async walletUnbond ({ dispatch }, args) {
      args.type = 'buildUnbond'
      await dispatch('walletTx', args)
    },
    async submitDelegation ({ state, dispatch }, delegation) {
      for (let delegate of delegation.delegates) {
        let candidateId = delegate.delegate.pub_key.data
        let currentlyDelegated = state.committedDelegates[candidateId] || 0
        let amountChange = delegate.atoms - currentlyDelegated
        let action = amountChange > 0 ? 'walletDelegate' : 'walletUnbond'

        // skip if no change
        if (amountChange === 0) continue

        // bonding takes a 'coin' object, unbond just takes a number
        let amount
        if (amountChange > 0) {
          // TODO: figure out which denom is bonding denom
          amount = { denom: 'fermion', amount: Math.abs(amountChange) }
        } else {
          amount = Math.abs(amountChange)
        }

        await new Promise((resolve, reject) => {
          dispatch(action, {
            amount,
            pub_key: delegate.delegate.pub_key,
            cb: (err, res) => {
              if (err) return reject(err)
              resolve(res)
            }
          })
        })
      }
    }
  }

  return { state, mutations, actions }
}
