const KEY_NAME = 'default'
// TODO: add UI for password, instead of hardcoding one
const KEY_PASSWORD = '1234567890'

export default ({ commit, node }) => {
  let state = {
    balances: [],
    key: { address: '' }
  }

  let mutations = {
    setWalletBalances (state, balances) {
      state.balances = balances
      console.log('setWalletBalances', balances)
    },
    setWalletKey (state, key) {
      state.key = key
      console.log('setWalletKey', key)
    }
  }

  let actions = {
    async initializeWallet ({ commit, dispatch }) {
      let key
      try {
        key = (await node.generateKey({ name: KEY_NAME, password: KEY_PASSWORD })).key
      } catch (err) {
        // TODO: check for "file exists" message once errors are handled
        // key was already created, fetch it
        key = await node.getKey(KEY_NAME)
      }
      commit('setWalletKey', key)

      // poll for balance updates every 2 seconds
      while (true) {
        dispatch('queryWalletBalances')
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    },
    async queryWalletBalances ({ state, commit }) {
      let res = await node.queryAccount(state.key.address)
      if (!res) return
      commit('setWalletBalances', res.data.coins)
    }
  }

  return { state, mutations, actions }
}
