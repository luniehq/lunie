export default ({ commit, basecoin }) => {
  // TODO: support multiple wallets
  const { wallets } = basecoin
  const wallet = wallets.default
  wallet.on('tx', () => {
    commit('updateBalances', wallet.getBalances())
  })

  const state = {
    default: {
      balances: wallet.getBalances(),
      expanded: true
    }
  }

  const mutations = {
    setWalletExpanded (state, data) {
      state[data.key].expanded = data.value
    },
    updateBalances (state, balances) {
      state.default.balances = balances
    }
  }

  return { state, mutations }
}
