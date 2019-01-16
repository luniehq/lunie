import { sleep } from "scripts/common.js"

const config = require(`../../../config.json`)
const NODE_HALTED_TIMEOUT = config.node_halted_timeout

export default function({ node }) {
  // get tendermint RPC client from basecoin client

  const state = {
    node: null,
    stopConnecting: false,
    connected: false,
    lastHeader: {
      height: 0,
      chain_id: ``
    },
    approvalRequired: null,
    mocked: node.mocked
  }

  const mutations = {
    stopConnecting(state, stop) {
      state.stopConnecting = stop
    },
    setConnected(state, connected) {
      state.connected = connected
    },
    setNode(state, node) {
      state.node = node
    },
    setNodeApprovalRequired(state, hash) {
      state.approvalRequired = hash
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
    async reconnect({ state, commit }) {
      if (state.stopConnecting) return

      commit(`setConnected`, false)
      node.rpcConnect(config.node_rpc)
    },
    async rpcSubscribe({ commit, dispatch, rootState }) {
      if (state.stopConnecting) return

      // the rpc socket can be closed before we can even attach a listener
      // so we remember if the connection is open
      // we handle the reconnection here so we can attach all these listeners on reconnect
      if (!node.rpcInfo.connected) {
        await sleep(500)
        dispatch(`reconnect`)
        return
      }

      commit(`setConnected`, true)
      commit(`setNode`, node)

      // TODO: get event from light-client websocket instead of RPC connection (once that exists)
      node.rpc.on(`error`, error => {
        if (error.message.indexOf(`disconnected`) !== -1) {
          commit(`setConnected`, false)
          dispatch(`reconnect`)
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
      if (rootState.user.signedIn) {
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
    nodeHasHalted({ commit }) {
      console.error(`node has halted`)
      clearTimeout(state.nodeHaltedTimeout)
      state.nodeHaltedTimeout = undefined
      commit(`setModalNodeHalted`, true)
    },
    pollRPCConnection({ state, dispatch }, timeout = config.block_timeout) {
      if (state.nodeTimeout || state.stopConnecting) return

      state.nodeTimeout = setTimeout(() => {
        // clear timeout doesn't work
        if (state.nodeTimeout && !state.mocked) {
          state.connected = false
          state.nodeTimeout = null
          dispatch(`pollRPCConnection`)
        }
      }, timeout)
      node.rpc.status().then(() => {
        state.nodeTimeout = null
        state.connected = true
        setTimeout(() => {
          dispatch(`pollRPCConnection`)
        }, timeout)
      })
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
