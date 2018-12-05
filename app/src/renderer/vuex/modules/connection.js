import { ipcRenderer, remote } from "electron"
import Raven from "raven-js"
import { sleep } from "scripts/common.js"

const config = remote.getGlobal(`config`)
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
    async reconnect({ commit }) {
      if (state.stopConnecting) return

      commit(`setConnected`, false)
      node.rpcReconnect()
    },
    async rpcSubscribe({ commit, dispatch }) {
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
      node.rpc.status((error, result) => {
        if (error) return console.error(error)
        let status = result
        dispatch(`setLastHeader`, {
          height: status.sync_info.latest_block_height,
          chain_id: status.node_info.network
        })
      })

      node.rpc.subscribe(
        { query: `tm.event = 'NewBlockHeader'` },
        (error, event) => {
          if (error) {
            Raven.captureException(error)
            return console.error(`error subscribing to headers`, error)
          }
          dispatch(`setLastHeader`, event.data.value.header)
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
    nodeHasHalted({ commit }) {
      console.log(`node has halted`)
      clearTimeout(state.nodeHaltedTimeout)
      state.nodeHaltedTimeout = undefined
      commit(`setModalNodeHalted`, true)
    },
    pollRPCConnection({ state, dispatch }, timeout = 3000) {
      if (state.nodeTimeout || state.stopConnecting) return

      state.nodeTimeout = setTimeout(() => {
        // clear timeout doesn't work
        if (state.nodeTimeout && !state.mocked) {
          state.connected = false
          state.nodeTimeout = null
          dispatch(`pollRPCConnection`)
        }
      }, timeout)
      node.rpc.status(error => {
        if (error) {
          Raven.captureException(error)
          console.error(`Couldn't get status via RPC:`, error)
          return
        }

        state.nodeTimeout = null
        state.connected = true
        setTimeout(() => {
          dispatch(`pollRPCConnection`)
        }, timeout)
      })
    },
    approveNodeHash({ state }, hash) {
      state.approvalRequired = null
      ipcRenderer.send(`hash-approved`, hash)
    },
    disapproveNodeHash({ state }, hash) {
      state.approvalRequired = null
      ipcRenderer.send(`hash-disapproved`, hash)
    },
    async setMockedConnector({ state, dispatch, commit }, mocked) {
      state.mocked = mocked

      // Tell the main process our status in case of reload.
      ipcRenderer.send(`mocked`, mocked)

      // disable updates from the live node
      node.rpcDisconnect()

      // switch to a mocked or live node
      node.setup(mocked)

      // reconnect to the node
      node.rpcReconnect()

      if (mocked) {
        // if we run a mocked version only, we don't want the lcd to run in the meantime
        ipcRenderer.send(`stop-lcd`)

        // we need to trigger this event for the mocked mode as it is usually triggered by the "connected" event from the main thread
        dispatch(`rpcSubscribe`)

        // the mocked node is automatically connected
        dispatch(`reconnected`)
      } else {
        // if we switch to a live connector, we need to wait for the process to have started up again so we can access the KMS
        commit(`setModalSession`, `loading`)
        await new Promise(resolve => ipcRenderer.once(`connected`, resolve))
      }

      // sign user out, as when switching from mocked to live node, the account address needs to be clarified again
      dispatch(`signOut`)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
