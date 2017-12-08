let fs = require('fs-extra')
let { join } = require('path')
let root = require('../../../root.js')

export const KEY_NAME = 'default'
// TODO: add UI for password, instead of hardcoding one
export const KEY_PASSWORD = '1234567890'

export default ({ commit, node }) => {
  let state = {
    balances: [],
    sequence: 0,
    key: { address: '' },
    history: [],
    denoms: []
  }

  let mutations = {
    setWalletBalances (state, balances) {
      state.balances = balances
    },
    setWalletKey (state, key) {
      state.key = key
    },
    setWalletSequence (state, sequence) {
      if (state.sequence === sequence) return
      state.sequence = sequence
    },
    setWalletHistory (state, history) {
      state.history = history
    },
    setDenoms (state, denoms) {
      state.denoms = denoms
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
      if (key) {
        commit('setWalletKey', key)
        dispatch('queryWalletState')
      } else {
        commit('setModalSession', true)
      }
    },
    queryWalletState ({ state, dispatch }) {
      dispatch('queryWalletBalances')
      dispatch('queryWalletSequence')
      dispatch('queryWalletHistory')
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
    async queryWalletHistory ({ state, commit }) {
      let res = await node.coinTxs(state.key.address)
      if (!res) return
      commit('setWalletHistory', res)
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
    },
    async loadDenoms () {
      // read genesis.json to get default denoms

      // wait for genesis.json to exist
      let genesisPath = join(root, 'genesis.json')
      while (true) {
        try {
          await fs.pathExists(genesisPath)
          break
        } catch (err) {
          console.log('waiting for genesis', err, genesisPath)
          await sleep(500)
        }
      }

      let genesis = await fs.readJson(genesisPath)
      let denoms = {}
      for (let account of genesis.app_options.accounts) {
        for (let { denom } of account.coins) {
          denoms[denom] = true
        }
      }

      commit('setDenoms', Object.keys(denoms))
    }
  }

  return { state, mutations, actions }
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
