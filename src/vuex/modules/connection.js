import { sleep } from "scripts/common.js"
import Vue from "vue"
import config from "src/config"

const NODE_HALTED_TIMEOUT = config.node_halted_timeout

export default function({ node }) {
  // get tendermint RPC client from basecoin client

  const state = {
    stopConnecting: false,
    connected: false,
    lastHeader: {
      height: 0,
      chain_id: ``
    },
    approvalRequired: null,
    mocked: node.mocked,
    nodeUrl: config.stargate,
    rpcUrl: config.rpc,
    externals: {
      node,
      config
    }
  }

  const mutations = {
    stopConnecting(state, stop) {
      Vue.set(state, `stopConnecting`, stop)
    },
    setConnected(state, connected) {
      Vue.set(state, `connected`, connected)
    },
    setRpcUrl(state, rpcUrl) {
      state.rpcUrl = rpcUrl
    }
  }

  const actions = {
    async setLastHeader({ state }, header) {
      state.lastHeader = header
    },
    async connect({ state, commit, dispatch }) {
      const {
        externals: { node },
        rpcUrl
      } = state

      if (state.stopConnecting) return

      commit(`setConnected`, false)
      try {
        await node.rpcConnect(rpcUrl)
        commit(`setConnected`, true)
        dispatch(`reconnected`)
        dispatch(`rpcSubscribe`)
        dispatch(`subscribeToBlocks`)
      } catch (err) {
        console.log(`Failed reconnect attempt`)
        setTimeout(() => {
          dispatch(`connect`)
        }, 1000)
      }
    },
    async rpcSubscribe({ commit, dispatch, rootState }) {
      const { node } = state.externals
      if (state.stopConnecting) return

      // the rpc socket can be closed before we can even attach a listener
      // so we remember if the connection is open
      // we handle the reconnection here so we can attach all these listeners on reconnect
      if (!node.rpcInfo.connected) {
        await sleep(500)
        dispatch(`connect`)
        return
      }

      commit(`setConnected`, true)

      // TODO: get event from light-client websocket instead of RPC connection (once that exists)
      node.rpc.on(`error`, error => {
        if (
          error instanceof Event || // this is always a disconnect, strange that it is 2 different types
          error.message.indexOf(`disconnected`) !== -1
        ) {
          commit(`setConnected`, false)
          dispatch(`connect`)
        }
      })
      node.rpc.status().then(status => {
        dispatch(`setLastHeader`, {
          height: status.sync_info.latest_block_height,
          chain_id: status.node_info.network
        })

        if (status.node_info.network === `testnet`) {
          commit(`setInsecureMode`)
        }
      })

      node.rpc.subscribe(
        {
          query: `tm.event = 'NewBlockHeader'`
        },
        ({ header }) => {
          dispatch(`setLastHeader`, header)
        }
      )
      if (rootState.session.signedIn) {
        dispatch(`walletSubscribe`)
      }
      dispatch(`checkNodeHalted`)
      dispatch(`pollRPCConnection`)
    },
    checkNodeHalted(
      { state, dispatch },
      nodeHaltedTimeout = NODE_HALTED_TIMEOUT
    ) {
      state.nodeHaltedTimeout = setTimeout(() => {
        if (!state.lastHeader.height) {
          dispatch(`nodeHasHalted`)
        }
      }, nodeHaltedTimeout) // default 30s
    },
    async pollRPCConnection(
      { state, dispatch, commit },
      timeout = config.block_timeout
    ) {
      const { node } = state.externals
      if (state.stopConnecting) return

      try {
        // TODO: replace with ping when we implement ws connection ourselves
        await node.rpc.health()
      } catch (err) {
        console.error(`Error pinging websocket. Assuming connection dropped.`)
        commit(`setConnected`, false)
        dispatch(`connect`)
        return
      }

      setTimeout(() => {
        dispatch(`pollRPCConnection`)
      }, timeout)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
