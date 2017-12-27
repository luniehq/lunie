import axios from 'axios'

export default ({ commit }) => {
  let state = {
    // our delegations, maybe not yet committed
    delegates: [],

    // our delegations which are already on the blockchain
    committedDelegates: []
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
    reserveAtoms (state, {delegateId, value}) {
      state.delegates.find(d => d.id === delegateId).reservedAtoms = value
    },
    setShares (state, {candidateId, value}) {
      state.delegates.find(c => c.id === candidateId).atoms = value
    },
    setCommittedDelegation (state, {candidateId, value}) {
      if (value === 0) {
        delete state.committedDelegates[candidateId]
      } else {
        state.committedDelegates[candidateId] = value
      }
    }
  }

  let actions = {
    // load committed delegations from LCD
    async getBondedDelegates ({ state, dispatch }, {candidates, address}) {
      // TODO move into cosmos-sdk
      candidates.forEach(candidate => {
        commit('addToCart', candidate)
        dispatch('getBondedDelegate', {address, pubkey: candidate.pub_key.data})
      })
    },
    // load committed delegation from LCD
    async getBondedDelegate ({ commit }, {address, pubkey}) {
      // TODO move into cosmos-sdk
      let bond = (await axios.get('http://localhost:8998/query/stake/delegator/' + address + '/' + pubkey)).data.data
      commit('setShares', {candidateId: bond.PubKey.data, value: bond.Shares})
      commit('setCommittedDelegation', {candidateId: bond.PubKey.data, value: bond.Shares})
    },
    walletDelegate ({ dispatch }, args) {
      args.type = 'buildDelegate'
      args.to = {
        chain: '',
        app: 'sigs',
        addr: args.to
      }
      dispatch('walletTx', args)
    },
    async submitDelegation ({ dispatch }, delegation) {
      console.log('submitting delegation txs: ', JSON.stringify(delegation))

      for (let delegate of delegation.delegates) {
        await new Promise((resolve, reject) => {
          dispatch('walletDelegate', {
            // TODO: figure out which denom is bonding denom
            amount: { denom: 'fermion', amount: delegate.atoms },
            pub_key: delegate.delegate.pub_key,
            cb: (err, res) => {
              if (err) return reject(err)
              resolve(res)
            }
          })
        })
      }

      commit('activateDelegation', true)
    }
  }

  return { state, mutations, actions }
}
