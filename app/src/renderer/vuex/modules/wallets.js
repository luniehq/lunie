export default ({ commit, basecoin }) => {
  const { wallets } = basecoin
  const state = {}
  for (let id in wallets) {
    let wallet = wallets[id]
    state[id] = {
      balances: wallet.getBalances(),
      expanded: false
    }
    wallet.on('tx', () => {
      commit('updateBalances', { id, balances: wallet.getBalances() })
    })
  }

  const mutations = {
    setWalletExpanded (state, data) {
      state[data.key].expanded = data.value
    },
    updateBalances (state, { balances, id }) {
      state[id].balances = balances
    },
    addWallet (state, { wallet, id }) {
      state[id] = wallet
    }
  }

  const actions = {
    createWallet ({ commit }) {
      console.log('createWallet')
      basecoin.wallet((err, wallet) => {
        if (err) throw err
        commit('addWallet', wallet)
      })
    }
  }

  return { state, mutations, actions }
}
