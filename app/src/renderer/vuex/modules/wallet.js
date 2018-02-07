let fs = require('fs-extra')
let { join } = require('path')
let root = require('../../../root.js')

export default ({ commit, node }) => {
  let state = {
    balances: [],
    balancesLoading: false,
    key: { address: '' },
    history: [],
    historyLoading: false,
    denoms: [],
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
    },
    setWalletHistory (state, history) {
      state.history = history
    },
    setDenoms (state, denoms) {
      state.denoms = denoms
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
      dispatch('queryNonce', state.key.address)
      dispatch('queryWalletHistory')
    },
    async queryWalletBalances ({ state, rootState, commit }) {
      state.balancesLoading = true
      let res = await node.queryAccount(state.key.address)
      if (!res) {
        state.balancesLoading = false
        return
      }
      commit('setWalletBalances', res.data.coins)
      for (let coin of res.data.coins) {
        if (coin.denom === rootState.config.bondingDenom) {
          commit('setAtoms', coin.amount)
          break
        }
      }
      state.balancesLoading = false
    },
    async queryWalletHistory ({ state, commit, dispatch }) {
      state.historyLoading = true
      let res = await node.coinTxs(state.key.address)
      if (!res) return
      commit('setWalletHistory', res)

      let blockHeights = []
      res.forEach(t => {
        if (!blockHeights.find(h => h === t.height)) {
          blockHeights.push(t.height)
        }
      })
      await Promise.all(blockHeights.map(h =>
        dispatch('queryTransactionTime', h)
      ))
      state.historyLoading = false
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
        node.rpc.blockchain({ minHeight: height, maxHeight: height }, (err, data) => {
          if (err) {
            commit('notifyError', {title: `Couldn't query block`, body: err.message})
            resolve(null)
          } else {
            resolve(data.block_metas[0])
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
      return dispatch('sendTx', args)
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
