let { join } = require('path')
let Basecoin = require('basecoin')
let root = require('../../../root.js')

// Connect to our local tendermint RPC server
let client = Basecoin('ws://localhost:46657')

// Create or load a wallet at a certain file path.
// A wallet is a database which stores a collection of accounts/keys,
// as well as a log of transactions.
let walletPath = join(root, 'wallet2.db')

let balances

client.wallet(walletPath).then((wallet) => {
  wallet.on('tx', (tx) => {
    // some coins were sent or received from an account in this wallet

    balances = wallet.getBalances()
    // balances is in this format:
    // [
    //   { denom: 'btc', amount: 1234 },
    //   { denom: 'atom', amount: 567890 }
    // ]
    console.log('balances loaded!', balances)
  })
})

const state = balances

const mutations = {
  setWalletExpanded (state, data) {
    state[data.key].expanded = data.value
  }
}

export default {
  state,
  mutations
}
