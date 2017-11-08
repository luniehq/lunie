'use strict'

export default ({ node }) => {
  // get tendermint RPC client from basecon client
  const { rpc, nodeIP } = node

  const state = {
    syncHeight: 0,
    syncTime: 0,
    syncing: true,
    nodeIP
  }

  const mutations = {
    setSync (state, { height, time, syncing }) {
      state.syncHeight = height
      state.syncTime = time
      state.syncing = syncing
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
      }, 1000)
    }
  }

  return { state, mutations, actions }
}
