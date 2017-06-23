export default ({ commit, node }) => {
  const state = { balances: node.wallet.getBalances() }
  node.wallet.on('tx', () => {
    let balances = node.wallet.getBalances()
    commit('updateBalances', balances)
  })

  const mutations = {
    updateBalances (state, balances) {
      state.balances = balances
    }
  }

  const actions = {
    send ({ commit }, { address, denom, amount, cb }) {
      let coins = [{ denom, amount }]
      node.wallet.send(Buffer(address, 'hex'), coins, (err, res) => {
        if (err) {
          if (cb) return cb(err)
          throw err
        }
        commit('updateBalances', node.wallet.getBalances())
        if (cb) cb(null)
      })
    }
  }

  return { state, mutations, actions }
}
