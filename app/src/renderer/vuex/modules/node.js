'use strict'

export default ({ node, store }) => {
  // get tendermint RPC client from basecon client
  const { rpc, nodeIP } = node

  const state = {
    syncHeight: 0,
    syncTime: 0,
    syncing: true,
    nodeIP,
    connected: false
  }

  const mutations = {
    setSync (state, { height, time, syncing }) {
      state.syncHeight = height
      state.syncTime = time
      state.syncing = syncing
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
        commit('setSync', {
          height: status.latest_block_height,
          time: status.latest_block_time / 1e6,
          syncing: status.syncing
        })
      })
    }
  }

  // TODO: get event from light-client websocket instead of RPC connection (once that exists)
  rpc.on('error', (err) => {
    console.log('rpc disconnected', err)
    store.commit('setConnected', false)
  })

  return { state, mutations, actions }
}
