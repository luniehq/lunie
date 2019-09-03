import Vue from "vue"

export const cache = (list, element, maxSize = 100) => {
  if (list.length >= maxSize) list.splice(-1, 1)
  list.unshift(element)
  return list
}

export default ({ node }) => {
  const state = {
    blockMetaInfo: { block_id: {} },
    blockMetas: {},
    peers: [],
    blocks: [],
    subscription: false,
    subscribedRPC: null,
    syncing: true,
    loading: false,
    loaded: false,
    error: null
  }

  const mutations = {
    setBlockHeight: (state, height) => (state.blockHeight = height),
    setSyncing: (state, syncing) => (state.syncing = syncing),
    setBlockMetas: (state, blockMetas) => (state.blockMetas = blockMetas),
    setPeers: (state, peers) => (state.peers = peers),
    setBlocks: (state, blocks) => (state.blocks = blocks),
    addBlock: (state, block) =>
      Vue.set(state, `blocks`, cache(state.blocks, block)),
    setSubscribedRPC: (state, subscribedRPC) =>
      (state.subscribedRPC = subscribedRPC),
    setSubscription: (state, subscription) =>
      (state.subscription = subscription),
    setBlocksLoading: (state, loading) => (state.loading = loading),
    setBlocksLoaded: (state, loaded) => (state.loaded = loaded),
    setBlockError: (state, error) => (state.error = error)
  }

  const actions = {
    reconnected({ commit, dispatch }) {
      //on a reconnect we assume, that the rpc connector changed, so we can safely resubscribe to blocks
      commit(`setSubscription`, false)
      dispatch(`subscribeToBlocks`)
    },
    async getBlockTxs({ dispatch }, height) {
      let txs = await node.get.txsByHeight(height)
      const time = (await dispatch("queryBlockInfo", height)).header.time
      txs = txs.map(tx =>
        Object.assign({}, tx, {
          height,
          time
        })
      )
      return txs
    },
    async queryBlockInfo({ state, commit }, height) {
      try {
        let blockMetaInfo = state.blockMetas[height]
        if (blockMetaInfo) {
          return blockMetaInfo
        }
        commit(`setBlocksLoading`, true)
        const block = await node.get.block(height)

        blockMetaInfo = block.block_meta

        commit(`setBlockMetas`, {
          ...state.blockMetas,
          [height]: blockMetaInfo
        })
        commit(`setBlocksLoading`, false)
        commit(`setBlocksLoaded`, true)
        return blockMetaInfo
      } catch (error) {
        commit(`setBlocksLoading`, false)
        commit(`setBlockError`, error)
        return undefined
      }
    },
    async queryBlock(_, height) {
      return await node.get.block(height)
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
