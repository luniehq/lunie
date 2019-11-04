import Vue from "vue"
import config from "src/../config"

const NODE_HALTED_TIMEOUT = config.node_halted_timeout
const MAX_CONNECTION_ATTEMPTS = 5

export default function({ node }) {
  // get tendermint RPC client from basecoin client

  const state = {
    stopConnecting: false,
    connected: false,
    lastHeader: {
      height: 0,
      chain_id: ``
    },
    network: config.network, // network id to reference network capabilities stored in Hasura
    connectionAttempts: 0,
    nodeUrl: config.stargate,
    rpcUrl: config.rpc,
    externals: {
      node,
      config
    }
  }

  const mutations = {
    stopConnecting(state, stop = true) {
      Vue.set(state, `stopConnecting`, stop)
    },
    setConnected(state, connected) {
      if (connected) {
        state.connectionAttempts = 0
      }
      Vue.set(state, `connected`, connected)
    },
    increaseConnectionAttempts(state) {
      state.connectionAttempts = state.connectionAttempts + 1
    },
    resetConnectionAttempts(state) {
      state.connectionAttempts = 0
    },
    setRpcUrl(state, rpcUrl) {
      console.log(state.rpcUrl, rpcUrl)
      state.rpcUrl = rpcUrl
    },
    setNetworkId(state, networkId) {
      state.network = networkId
    }
  }

  const actions = {
    async setLastHeader({ state }, header) {
      state.lastHeader = header
    },
    reconnect({ commit, dispatch }) {
      commit("resetConnectionAttempts")
      commit("stopConnecting", false)
      dispatch("connect")
    },
    async connect({ state, commit, dispatch }) {
      const {
        externals: { node },
        rpcUrl,
        connectionAttempts,
        stopConnecting
      } = state

      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        commit("stopConnecting")
        return
      }
      if (stopConnecting) return

      commit(`setConnected`, false)
      try {
        await node.tendermint.connect(rpcUrl)
        node.tendermint.ondisconnect = () => {
          commit(`setConnected`, false)
          dispatch(`connect`)
        }
        commit(`setConnected`, true)
        dispatch(`reconnected`)
        dispatch(`rpcSubscribe`)
        dispatch(`subscribeToBlocks`)
      } catch (err) {
        console.log(`Failed reconnect attempt`)
        commit("increaseConnectionAttempts")
        setTimeout(() => {
          dispatch(`connect`)
        }, 1000)
      }
    },
    async rpcSubscribe({ commit, dispatch, rootState }) {
      const { node } = state.externals
      if (state.stopConnecting) return

      node.tendermint.status().then(status => {
        dispatch(`setLastHeader`, {
          height: status.sync_info.latest_block_height,
          chain_id: status.node_info.network
        })

        if (status.node_info.network === `testnet`) {
          commit(`setInsecureMode`, true)
        }
      })

      node.tendermint.subscribe(
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
    async setNetwork({ commit, dispatch }, network) {
      commit("setNetworkId", network.id)
      commit("setRpcUrl", network.rpc_url)
      dispatch("reconnect")
      console.info(
        `Connecting to: ${network.title} (${network.chain_id}) – ${network.rpc_url}`
      )
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
