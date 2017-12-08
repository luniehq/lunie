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
    denoms: [],
    sendQueue: [],
    sending: false
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
    },
    queueSend (state, sendReq) {
      state.sendQueue.push(sendReq)
    },
    shiftSendQueue (state) {
      state.sendQueue = state.sendQueue.shift(1)
    },
    setSending (state, sending) {
      state.sending = sending
    }
  }

  let actions = {
    initializeWallet ({ commit, dispatch }, key) {
      commit('setWalletKey', key)
      dispatch('queryWalletState')
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
    async walletSend ({ state, dispatch, commit }, args) {
      // wait until the current send operation is done
      if (state.sending) {
        commit('queueSend', args)
        return
      }
      commit('setSending', true)

      let cb = args.cb
      delete args.cb

      // once done, do next send in queue
      function done (err, res) {
        commit('setSending', false)

        if (state.sendQueue.length > 0) {
          // do next send
          let send = state.sendQueue[0]
          commit('shiftSendQueue')
          dispatch('walletSend', send)
        }

        cb(err, res)
      }

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
        let res = await node.postTx(signedTx)
        // check response code
        if (res.check_tx.code !== 0 || res.deliver_tx.code !== 0) {
          let message = res.check_tx.log || res.deliver_tx.log
          return done(new Error('Error sending tx: ' + message))
        }

        commit('setWalletSequence', args.sequence)
      } catch (err) {
        return done(err)
      }
      done(null, args)
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
