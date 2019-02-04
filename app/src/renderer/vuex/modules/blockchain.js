import * as Sentry from "@sentry/browser"
import Vue from "vue"

const maxBlocks = 100

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
    blocks: []
  }

  const mutations = {
    setLoading(state, loading) {
      state.loading = loading
    },
    setError(state, error) {
      console.log(`EEROOOOOOO`)
      state.error = error
    },
    setBlockHeight(state, height) {
      state.blockHeight = height
    },
    setSyncing(state, syncing) {
      state.syncing = syncing
    },
    setBlockMetas(state, blockMetas) {
      state.blockMetas = blockMetas
    },
    setPeers(state, peers) {
      Vue.set(state, `peers`, peers)
    },
    setBlocks(state, blocks) {
      Vue.set(state, `blocks`, blocks)
    },
    addBlock(state, block) {
      const blocks = state.blocks
      if (blocks.length > maxBlocks) blocks.splice(-1, 1)
      blocks.unshift(block)
      // immutable version [block, ...blocks] gets slower if maxBlocks is over 100K
      Vue.set(state, `blocks`, blocks)
    },
    setSubscribedRPC(state, subscribedRPC) {
      state.subscribedRPC = subscribedRPC
    },
    setSubscription(state, subscription) {
      state.subscription = subscription
    }
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
        const { block_metas } = await node.rpc.blockchain({
          minHeight: String(height),
          maxHeight: String(height)
        })
        blockMetaInfo = block_metas ? block_metas[0] : undefined
        commit(`setLoading`, false)

        commit(`setBlockMetas`, {
          ...state.blockMetas,
          [height]: blockMetaInfo
        })
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

      // only subscribe if the node is not catching up anymore
      node.rpc.subscribe({ query: `tm.event = 'NewBlock'` }, event => {
        if (state.subscription === false) commit(`setSubscription`, true)
        commit(`addBlock`, event.block)
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
