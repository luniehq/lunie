const KEY_NAME = 'default'
// TODO: add UI for password, instead of hardcoding one
const KEY_PASSWORD = '1234567890'

export default ({ commit, node }) => {
  let state = {
    balances: [
      // TODO: set denom list dynamically somehow (maybe from denoms genesis.json?)
      { denom: 'atom', amount: 0 },
      { denom: 'mycoin', amount: 0 }
    ],
    sequence: 0,
    key: { address: '' }
  }

  let mutations = {
    setWalletBalances (state, balances) {
      state.balances = Object.assign({}, state.balances, balances)
    },
    setWalletKey (state, key) {
      state.key = key
      console.log('setWalletKey', key)
    },
    setWalletSequence (state, sequence) {
      if (state.sequence === sequence) return
      state.sequence = sequence
      console.log('setWalletSequence', sequence)
    }
  }

  let actions = {
    async initializeWallet ({ commit, dispatch }) {
      let key
      // key was already created, fetch it
      try {
        key = await node.getKey(KEY_NAME)
      } catch (e) {
        console.log(`Key '${KEY_NAME}' does not exist`)
      }
      if (!key) {
        console.log(`Creating new key '${KEY_NAME}'`)
        key = (await node.generateKey({ name: KEY_NAME, password: KEY_PASSWORD })).key
      }
      commit('setWalletKey', key)
      dispatch('queryWalletState')
    },
    queryWalletState ({ state, dispatch }) {
      dispatch('queryWalletBalances')
      dispatch('queryWalletSequence')
    },
    async queryWalletBalances ({ state, commit }) {
      let res = await node.queryAccount(state.key.address)
      if (!res) return
      commit('setWalletBalances', res.data.coins)
    },
    async queryWalletSequence ({ state, commit }) {
      let res = await node.queryNonce(state.key.address)
      if (!res) return
      commit('setWalletSequence', res.data)
    },
    async walletSend ({ state, dispatch }, args) {
      let cb = args.cb
      delete args.cb
      try {
        if (args.sequence == null) {
          args.sequence = state.sequence + 1
        }
        args.to = {
          chain: '',
          app: 'sigs',
          addr: args.to
        }
        args.from = {
          chain: '',
          app: 'sigs',
          addr: state.key.address
        }
        let tx = await node.buildSend(args)
        let signedTx = await node.sign({
          name: KEY_NAME,
          password: KEY_PASSWORD,
          tx
        })
        await node.postTx(signedTx)
      } catch (err) {
        return cb(err)
      }
      if (cb) cb(null, args)
      dispatch('queryWalletBalances')
    }
  }

  return { state, mutations, actions }
}
