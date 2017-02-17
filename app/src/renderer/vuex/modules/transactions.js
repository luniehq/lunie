export default ({ commit, basecoin }) => {
  const { wallets } = basecoin

  let state = []
  for (let id in wallets) {
    let wallet = wallets[id]
    state = state.concat(wallet.txs)
    wallet.on('tx', (tx) => commit('addTransaction', tx))
  }
  state.sort((a, b) => b.time - a.time)

  const mutations = {
    addTransaction (state, transaction) {
      state.push(transaction)
    }
  }
  return { state, mutations }
}
