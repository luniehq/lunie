import { set } from 'vue'

function walletState (wallet) {
  return {
    balances: wallet.getBalances(),
    expanded: false
  }
}

export default ({ commit, basecoin }) => {
  const { wallets } = basecoin
  const state = { wallets: {} }
  for (let id in wallets) {
    let wallet = wallets[id]
    state.wallets[id] = walletState(wallet)
    wallet.on('tx', () => {
      let balances = wallet.getBalances()
      commit('updateBalances', { id, balances })
    })
  }

  const mutations = {
    setWalletExpanded (state, data) {
      state.wallets[data.key].expanded = data.value
    },
    updateBalances (state, { balances, id }) {
      state.wallets[id].balances = balances
    },
    addWallet (state, { wallet, id }) {
      set(state.wallets, id, walletState(wallet))
    }
  }

  const actions = {
    createWallet ({ commit }) {
      basecoin.wallet((err, wallet) => {
        if (err) throw err
        commit('addWallet', wallet)
      })
    },
    send ({ commit }, { address, amount }) {
      // TODO: support wallet selection
      let wallet = wallets.default
      let coins = [{ denom: 'atom', amount }]
      wallet.send(Buffer(address, 'hex'), coins, (err, res) => {
        if (err) throw err
        commit('updateBalances', {
          balances: wallet.getBalances(),
          id: 'default'
        })
      })
    }
  }

  return { state, mutations, actions }
}
