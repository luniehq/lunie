export default ({ basecoin }) => {
  const { wallets } = basecoin
  const state = { default: {} }

  const wallet = wallets.default
  let updateState = () => {
    state.default.balances = wallet.getBalances()
  }
  state.default.accounts = wallet.accounts
  state.default.addresses = wallet.addresses
  state.default.txs = wallet.txs
  state.default.state = wallet.state
  wallet.on('tx', updateState)
  updateState()

  const mutations = {
    setWalletExpanded (state, data) {
      state[data.key].expanded = data.value
    }
  }

  return { state, mutations }
}
