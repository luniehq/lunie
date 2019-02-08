import * as Sentry from "@sentry/browser"
import Vue from "vue"

export const cache = (list, element, maxSize = 100) => {
  if (list.length >= maxSize) list.splice(-1, 1)
  list.unshift(element)
  return list
}

export default ({ node }) => {
  const state = {
    blockMetaInfo: { block_id: {} },
    blockHeight: null, // we remember the height so we can requery the block, if querying failed
    subscription: false,
    syncing: true,
    blockMetas: {},
    subscribedRPC: null,
    loading: false,
    error: null,
    peers: [],
    blocks: [],
    block: {
      block_meta: {}
    }
  }

  const mutations = {
    setLoading: (state, loading) => (state.loading = loading),
    setError: (state, error) => (state.error = error),
    setBlockHeight: (state, height) => (state.blockHeight = height),
    setSyncing: (state, syncing) => (state.syncing = syncing),
    setBlockMetas: (state, blockMetas) => (state.blockMetas = blockMetas),
    setPeers: (state, peers) => (state.peers = peers),
    setBlocks: (state, blocks) => (state.blocks = blocks),
    setBlock: (state, block) => (state.block = block),
    addBlock: (state, block) =>
      Vue.set(state, `blocks`, cache(state.blocks, block)),
    setSubscribedRPC: (state, subscribedRPC) =>
      (state.subscribedRPC = subscribedRPC),
    setSubscription: (state, subscription) =>
      (state.subscription = subscription)
  }

  const actions = {
    reconnected({ commit, dispatch }) {
      //on a reconnect we assume, that the rpc connector changed, so we can safely resubscribe to blocks
      commit(`setSubscription`, false)
      dispatch(`subscribeToBlocks`)
    },
    async queryBlockInfo({ state, commit }, height) {
      try {
        let blockMetaInfo = state.blockMetas[height]
        if (blockMetaInfo) {
          return blockMetaInfo
        }
        commit(`setLoading`, true)
        const block = await node.getBlock(height)

        blockMetaInfo = block.block_metas ? block.block_metas[0] : undefined
        commit(`setLoading`, false)

        commit(`setBlockMetas`, {
          ...state.blockMetas,
          [height]: blockMetaInfo
        })
        commit(`setBlock`, block)
        return blockMetaInfo
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching block information`,
          body: error.message
        })
        Sentry.captureException(error)
        commit(`setLoading`, false)
        commit(`setError`, error)
        return null
      }
    },
    async subscribeToBlocks({ state, commit, dispatch }) {
      // ensure we never subscribe twice
      if (state.subscription) return false
      if (state.subscribedRPC === node.rpc) return false
      commit(`setSubscribedRPC`, node.rpc)

      const status = await node.rpc.status()
      commit(`setBlockHeight`, status.sync_info.latest_block_height)
      if (status.sync_info.catching_up) {
        // still syncing, let's try subscribing again in 30 seconds
        commit(`setSyncing`, true)
        commit(`setSubscription`, false)
        setTimeout(() => dispatch(`subscribeToBlocks`), 30e3)
        return false
      }

      commit(`setSyncing`, false)
      // New RPC endpoint in sync, reset UI block list
      commit(`setBlocks`, [])

      // only subscribe if the node is not catching up anymore
      node.rpc.subscribe({ query: `tm.event = 'NewBlock'` }, event => {
        if (state.subscription === false) commit(`setSubscription`, true)
        commit(`addBlock`, event.block)
        event.block &&
          event.block.header &&
          commit(`setBlockHeight`, event.block.header.height)
      })

      return true
    },
    async getPeers({ state, commit }) {
      if (!(state.connected && node.rpc)) return []

      const {
        result: { peers }
      } = await node.rpc.net_info()
      commit(`setPeers`, peers)
      return peers
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
