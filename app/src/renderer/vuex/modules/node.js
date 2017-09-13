'use strict'

export default ({ node }) => {
  // get tendermint RPC client from basecon client
  const { rpc } = node

  const state = {
    syncHeight: 0,
    syncTime: 0,
    syncing: true,
    numPeers: 0
  }

  const mutations = {
    setSync (state, { height, time, syncing }) {
      state.syncHeight = height
      state.syncTime = time
      state.syncing = syncing
    },
    setNumPeers (state, numPeers) {
      state.numPeers = numPeers
    }
  }

  const actions = {
    startPollingNodeStatus ({ commit }) {
      setInterval(() => {
        rpc.status((err, res) => {
          if (err) return console.error(err)
          let status = res
          commit('setSync', {
            height: status.latest_block_height,
            time: status.latest_block_time / 1e6,
            syncing: status.syncing
          })
        })
        rpc.netInfo((err, res) => {
          if (err) return console.error(err)
          let netInfo = res
          commit('setNumPeers', netInfo.peers.length)
        })
      }, 1000)
    }
  }

  return { state, mutations, actions }
}
