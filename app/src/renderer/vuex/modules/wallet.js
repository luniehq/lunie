let fs = require('fs-extra')
let { join } = require('path')
let root = require('../../../root.js')
const axios = require('axios')

export default ({ commit, node }) => {
  let state = {
    balances: [],
    sequence: 0,
    key: { address: '' },
    history: [],
    denoms: [],
    sendQueue: [],
    sending: false,
    blockMetas: []
  }

  let mutations = {
    setWalletBalances (state, balances) {
      state.balances = balances
    },
    setWalletKey (state, key) {
      state.key = key
      // clear previous account state
      state.balances = []
      state.history = []
      state.sequence = 0
    },
    setWalletSequence (state, sequence) {
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
    },
    setTransactionTime (state, { blockHeight, blockMetaInfo }) {
      state.history = state.history.map(t => {
        if (t.height === blockHeight) {
          t.time = blockMetaInfo.header.time
        }
        return t
      })
    }
  }

  let actions = {
    initializeWallet ({ commit, dispatch }, key) {
      commit('setWalletKey', key)
      dispatch('loadDenoms')
      dispatch('queryWalletState')
    },
    queryWalletState ({ state, dispatch }) {
      dispatch('queryWalletBalances')
      dispatch('queryWalletSequence')
      dispatch('queryWalletHistory')
    },
    async queryWalletBalances ({ state, rootState, commit }) {
      let res = await node.queryAccount(state.key.address)
      if (!res) return
      commit('setWalletBalances', res.data.coins)
      for (let coin of res.data.coins) {
        if (coin.denom === rootState.config.bondingDenom) {
          commit('setAtoms', coin.amount)
          break
        }
      }
    },
    async queryWalletSequence ({ state, commit }) {
      let res = await node.queryNonce(state.key.address)
      if (!res) return
      commit('setWalletSequence', res.data)
    },
    async queryWalletHistory ({ state, commit, dispatch }) {
      let res = await fetch('http://localhost:8999/tx/coin/' + state.key.address).then(res => res.json())
      // let res = await node.coinTxs(state.key.address)
      if (!res) return
      commit('setWalletHistory', res)

      let blockHeights = []
      res.forEach(t => {
        if (!blockHeights.find(h => h === t.height)) {
          blockHeights.push(t.height)
        }
      })
      return Promise.all(blockHeights.map(h =>
        dispatch('queryTransactionTime', h)
      ))
    },
    async queryTransactionTime ({ commit, dispatch }, blockHeight) {
      let blockMetaInfo = await dispatch('queryBlockInfo', blockHeight)
      commit('setTransactionTime', { blockHeight, blockMetaInfo })
    },
    async queryBlockInfo ({ state, commit }, height) {
      let blockMetaInfo = state.blockMetas.find(b => b.header.height === height)
      if (blockMetaInfo) {
        return blockMetaInfo
      }
      blockMetaInfo = await new Promise((resolve, reject) => {
        node.rpc.blockchain({ minHeight: height, maxHeight: height }, (err, {block_metas}) => {
          if (err) {
            commit('notifyError', {title: `Couldn't query block`, body: err.message})
            reject()
          } else {
            resolve(block_metas[0])
          }
        })
      })
      blockMetaInfo && state.blockMetas.push(blockMetaInfo)
      return blockMetaInfo
    },
    async walletSend ({ dispatch }, args) {
      args.type = 'buildSend'
      args.to = {
        chain: '',
        app: 'sigs',
        addr: args.to
      }
      await dispatch('walletTx', args)
    },
    async walletTx ({ state, dispatch, commit, rootState }, args) {
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
        args.from = {
          chain: '',
          app: 'sigs',
          addr: state.key.address
        }
        // let tx = await node[args.type](args)
        // TODO fix in cosmos-sdk-js
        let tx = await (async function () {
          switch (args.type) {
            case 'buildDelegate': return axios.post('http://localhost:8998/build/stake/delegate', args)
              .then(res => res.data)
            case 'buildUnbond': return axios.post('http://localhost:8998/build/stake/unbond', args)
              .then(res => res.data)
            default: return node[args.type](args)
          }
        })()
        let signedTx = await node.sign({
          name: rootState.user.account,
          password: rootState.user.password,
          tx
        })
        let res = await node.postTx(signedTx)
        // check response code
        if (res.check_tx.code || res.deliver_tx.code) {
          let message = res.check_tx.log || res.deliver_tx.log
          return done(new Error('Error sending transaction: ' + message))
        }

        commit('setWalletSequence', args.sequence)
      } catch (err) {
        return done(err)
      }
      done(null, args)
      dispatch('queryWalletBalances')
    },
    async loadDenoms ({ state, commit }) {
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
