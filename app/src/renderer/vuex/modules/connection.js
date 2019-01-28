import { sleep } from "scripts/common.js"
import Vue from "vue"

const config = require(`../../../config.json`)
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
    nodeUrl: config.node_lcd,
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
    setNodeApprovalRequired(state, hash) {
      Vue.set(state, `approvalRequired`, hash)
    }
  }

  const actions = {
    async setLastHeader({ state, rootState, dispatch }, header) {
      state.lastHeader = header

      // updating the header is done even while the user is not logged in
      // to prevent errors popping up from the LCD before the user is signed on, we skip updating validators before
      // TODO identify why rest calls fail at this point
      if (rootState.user.signedIn)
        await dispatch(`maybeUpdateValidators`, header)
    },
    async connect({ state, commit, dispatch }) {
      const { node, config } = state.externals

      if (state.stopConnecting) return

      commit(`setConnected`, false)
      try {
        await node.rpcConnect(config.node_rpc)
        commit(`setConnected`, true)
        dispatch(`rpcSubscribe`)
        dispatch(`subscribeToBlocks`)
      } catch (err) {
        console.log(`Failed reconnect attempt`)
        setTimeout(() => {
          dispatch(`connect`)
        }, 1000)
      }
    },
    async rpcSubscribe({ commit, dispatch }) {
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
      })

      node.rpc.subscribe(
        { query: `tm.event = 'NewBlockHeader'` },
        ({ header }) => {
          dispatch(`setLastHeader`, header)
        }
      )

      dispatch(`walletSubscribe`)
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
