let { join } = require('path')
let root = require('../../../root.js')

export default ({ basecoin }) => {
  const state = {}

  // initialize default wallet
  let walletPath = join(root, 'wallet.db')
  basecoin.wallet(walletPath).then((wallet) => {
    let updateState = () => {
      state.balances = wallet.getBalances()
    }
    state.accounts = wallet.accounts
    state.addresses = wallet.addresses
    state.txs = wallet.txs
    state.state = wallet.state
    wallet.on('tx', updateState)
    updateState()
  })

  const mutations = {
    setWalletExpanded (state, data) {
      state[data.key].expanded = data.value
    }
  }

  return { state, mutations }
}
