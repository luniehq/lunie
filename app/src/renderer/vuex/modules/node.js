import { setTimeout } from "timers"
import { ipcRenderer, remote } from "electron"
import { sleep } from "scripts/common.js"

const config = remote.getGlobal("config")
const NODE_HALTED_TIMEOUT = config.node_halted_timeout

export default function({ node }) {
  // get tendermint RPC client from basecoin client

  const state = {
    nodeIP: null,
    stopConnecting: false,
    connected: false,
    lastHeader: {
      height: 0,
      chain_id: ""
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
    setNode(state, nodeIP) {
      state.nodeIP = nodeIP
    },
    setNodeApprovalRequired(state, hash) {
      state.approvalRequired = hash
    }
  }

  const actions = {
    setLastHeader({ state, rootState }, header) {
      state.lastHeader = header

      // TODO do this somewhere else probably
      if (!rootState.wallet.zoneIds.find(x => x === header.chain_id)) {
        rootState.wallet.zoneIds.unshift(header.chain_id)
      }
    },
    async reconnect({ commit }) {
      if (state.stopConnecting) return

      commit("setConnected", false)
      node.rpcReconnect()
    },
    async rpcSubscribe({ commit, dispatch }) {
      if (state.stopConnecting) return

      // the rpc socket can be closed before we can even attach a listener
      // so we remember if the connection is open
      // we handle the reconnection here so we can attach all these listeners on reconnect
      if (!node.rpcInfo.connected) {
        await sleep(500)
        dispatch("reconnect")
        return
      }

      commit("setConnected", true)
      commit("setNode", node.rpcInfo.nodeIP)

      // TODO: get event from light-client websocket instead of RPC connection (once that exists)
      node.rpc.on("error", err => {
        if (err.message.indexOf("disconnected") !== -1) {
          commit("setConnected", false)
          dispatch("reconnect")
        }
      })
      node.rpc.status((err, res) => {
        if (err) return console.error(err)
        let status = res
        dispatch("setLastHeader", {
          height: status.sync_info.latest_block_height,
          chain_id: status.node_info.network
        })
      })

      node.rpc.subscribe(
        { query: "tm.event = 'NewBlockHeader'" },
        (err, event) => {
          if (err) {
            return console.error("error subscribing to headers", err)
          }
          dispatch("setLastHeader", event.data.value.header)
        }
      )

      dispatch("validatorUpdateSubscribe")
      dispatch("walletSubscribe")
      dispatch("checkNodeHalted")
      dispatch("pollRPCConnection")
    },
    checkNodeHalted({ state, dispatch }) {
      state.nodeHaltedTimeout = setTimeout(() => {
        if (!state.lastHeader.height) {
          dispatch("nodeHasHalted")
        }
      }, NODE_HALTED_TIMEOUT) // default 30s
    },
    nodeHasHalted({ commit }) {
      clearTimeout(state.nodeHaltedTimeout)
      commit("setModalNodeHalted", true)
    },
    async checkConnection({ commit }) {
      let error = () =>
        commit("notifyError", {
          title: "Critical Error",
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
    pollRPCConnection({ state, dispatch }, timeout = 3000) {
      if (state.nodeTimeout || state.stopConnecting) return

      state.nodeTimeout = setTimeout(() => {
        // clear timeout doesn't work
        if (state.nodeTimeout && !state.mocked) {
          state.nodeTimeout = null
          dispatch("reconnect")
        }
      }, timeout)
      node.rpc.status(err => {
        if (!err) {
          state.nodeTimeout = null
          setTimeout(() => {
            dispatch("pollRPCConnection")
          }, timeout)
        }
      })
    },
    approveNodeHash({ state }, hash) {
      state.approvalRequired = null
      ipcRenderer.send("hash-approved", hash)
    },
    disapproveNodeHash({ state }, hash) {
      state.approvalRequired = null
      ipcRenderer.send("hash-disapproved", hash)
    },
    async setMockedConnector({ state, dispatch, commit }, mocked) {
      state.mocked = mocked

      // Tell the main process our status in case of reload.
      ipcRenderer.send(`mocked`, mocked)

      // IDEA let's have an event 'networkSwitched' and bundle those action under this one
      // remove blocks from block explorer as it should not show blocks of another network
      commit("setBlocks", [])

      // disable updates from the live node
      node.rpcDisconnect()

      // switch to a mocked or live node
      node.setup(mocked)

      // reconnect to the node
      node.rpcReconnect()

      if (mocked) {
        // if we run a mocked version only, we don't want the lcd to run in the meantime
        ipcRenderer.send("stop-lcd")

        // we need to trigger this event for the mocked mode as it is usually triggered by the "connected" event from the main thread
        dispatch("rpcSubscribe")

        // the mocked node is automatically connected
        dispatch("reconnected")
      } else {
        // if we switch to a live connector, we need to wait for the process to have started up again so we can access the KMS
        commit("setModalSession", "loading")
        await new Promise(resolve => ipcRenderer.once("connected", resolve))
      }

      // sign user out, as when switching from mocked to live node, the account address needs to be clarified again
      dispatch("signOut")
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
