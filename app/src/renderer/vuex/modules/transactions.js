function clone (obj) {
  return Object.assign({}, obj)
}

export default ({ commit, basecoin }) => {
  const { wallets } = basecoin
  const wallet = wallets.default
  wallet.on('tx', (tx) => {
    commit('addTransaction', tx)
  })

  const state = wallets.default.txs.map(clone)
  const mutations = {
    addTransaction (state, transaction) {
      state.push(transaction)
    }
  }
  return { state, mutations }
}
