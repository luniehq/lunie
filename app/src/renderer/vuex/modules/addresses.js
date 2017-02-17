export default ({ commit, basecoin }) => {
  // TODO: support multiple wallets
  const { wallets } = basecoin
  const wallet = wallets.default

  const state = wallet.addresses.map(
    (address) => ({ address, walletId: 'default' }))

  const mutations = {
    addAddress (state, data) {
      state.push(data)
    }
  }

  const actions = {
    generateAddress ({ commit }) {
      // TODO: support multiple wallets
      wallet.createAccount((err, account) => {
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
