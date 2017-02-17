export default ({ commit, basecoin }) => {
  const { wallets } = basecoin

  let state = []
  for (let walletId in wallets) {
    let wallet = wallets[walletId]
    state = state.concat(wallet.addresses.map(
      (address) => ({ address, walletId })))
  }

  const mutations = {
    addAddress (state, data) {
      state.push(data)
    }
  }

  const actions = {
    generateAddress ({ commit }) {
      // TODO: support multiple wallets
      wallets.default.createAccount((err, account) => {
        if (err) throw err
        commit('addAddress', {
          address: account.key.address(),
          walletId: 'default'
        })
      })
    }

  }

  return { state, mutations, actions }
}
