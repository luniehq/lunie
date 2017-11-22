'use strict'

export default function ({ node, commit, dispatch }) {
  // get tendermint RPC client from basecon client
  const { rpc, nodeIP } = node

  const state = {
    nodeIP,
    connected: false,
    lastHeader: {
      height: 0,
      chain_id: ''
    }
  }

  const mutations = {
    setLastHeader (state, header) {
      state.lastHeader = header
      dispatch('maybeUpdateValidators', header)
    },
    setConnected (state, connected) {
      state.connected = connected
    }
  }

  const actions = {
    updateNodeStatus ({ commit }) {
      rpc.status((err, res) => {
        if (err) return console.error(err)
        let status = res
        commit('setConnected', true)
        commit('setLastHeader', {
          height: status.latest_block_height,
          chain_id: status.node_info.network
        })
      })
    }
  }

  // TODO: get event from light-client websocket instead of RPC connection (once that exists)
  rpc.on('error', (err) => {
    console.log('rpc disconnected', err)
    commit('setConnected', false)
  })
  rpc.subscribe({ event: 'NewBlockHeader' }, (err, event) => {
    if (err) return console.error('error subscribing to headers', err)
    commit('setConnected', true)
    commit('setLastHeader', event.data.data.header)
  })

  return { state, mutations, actions }
}
