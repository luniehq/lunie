import { setTimeout } from 'timers'

'use strict'

export default function ({ node }) {
  // get tendermint RPC client from basecoin client
  const { nodeIP } = node

  const state = {
    nodeIP,
    stopConnecting: false,
    connected: false,
    lastHeader: {
      height: 0,
      chain_id: ''
    }
  }

  const mutations = {
    stopConnecting (state, stop) {
      state.stopConnecting = stop
    },
    setConnected (state, connected) {
      state.connected = connected
    }
  }

  const actions = {
    reconnected ({ commit, dispatch }) {
      dispatch('rpcSubscribe')
    },
    setLastHeader ({ state, dispatch }, header) {
      state.lastHeader = header
      dispatch('maybeUpdateValidators', header)
    },
    async reconnect ({ commit, dispatch }) {
      if (state.stopConnecting) return

      commit('setConnected', false)
      node.rpcReconnect()
    },
    async rpcSubscribe ({ commit, dispatch }) {
      if (state.stopConnecting) return

      // the rpc socket can be closed before we can even attach a listener
      // so we remember if the connection is open
      // we handle the reconnection here so we can attach all these listeners on reconnect
      if (!node.rpcInfo.connected) {
        await sleep(500)
        dispatch('reconnect')
        return
      }

      commit('setConnected', true)

      // TODO: get event from light-client websocket instead of RPC connection (once that exists)
      node.rpc.on('error', (err) => {
        if (err.message.indexOf('disconnected') !== -1) {
          commit('setConnected', false)
          dispatch('reconnect')
        }
      })
      node.rpc.status((err, res) => {
        if (err) return console.error(err)
        let status = res
        dispatch('setLastHeader', {
          height: status.latest_block_height,
          chain_id: status.node_info.network
        })
      })

      node.rpc.subscribe({ query: "tm.event = 'NewBlockHeader'" }, (err, event) => {
        if (err) return console.error('error subscribing to headers', err)
        dispatch('setLastHeader', event.data.data.header)
      })

      dispatch('pollRPCConnection')
    },
    async checkConnection ({ commit }) {
      let error = () => commit('notifyError', {
        title: 'Critical Error',
        body: `Couldn't initialize the blockchain client. If the problem persists, please make an issue on GitHub.`
      })
      try {
        if (await node.lcdConnected()) {
          return true
        } else {
          error()
          return false
        }
      } catch (err) {
        error()
        return false
      }
    },
    pollRPCConnection ({ state, commit, dispatch }, timeout = 3000) {
      if (state.nodeTimeout || state.stopConnecting) return

      state.nodeTimeout = setTimeout(() => {
        // clear timeout doesn't work
        if (state.nodeTimeout) {
          state.nodeTimeout = null
          dispatch('reconnect')
        }
      }, timeout)
      node.rpc.status((err, res) => {
        if (!err) {
          state.nodeTimeout = null
          setTimeout(() => {
            dispatch('pollRPCConnection')
          }, timeout)
        }
      })
    }
  }

  return {
    state, mutations, actions
  }
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
