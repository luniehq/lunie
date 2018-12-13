import * as Sentry from "@sentry/browser"

export default ({ node }) => {
  const state = {
    blockMetaInfo: { block_id: {} },
    blockHeight: null, // we remember the height so we can requery the block, if querying failed
    subscription: false,
    syncing: true,
    blockMetas: {},
    subscribedRPC: null,
    loading: false,
    error: null
  }

  const mutations = {
    setBlockHeight(state, height) {
      state.blockHeight = height
    },
    setSyncing(state, syncing) {
      state.syncing = syncing
    },
    setBlockMetas(state, blockMetas) {
      state.blockMetas = blockMetas
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
        state.loading = true
        blockMetaInfo = await new Promise((resolve, reject) => {
          node.rpc.blockchain(
            { minHeight: height, maxHeight: height },
            (error, data) => {
              if (error) {
                reject(`Couldn't query block. ${error.message}`)
              } else {
                resolve(data.block_metas && data.block_metas[0])
              }
            }
          )
        })
        state.loading = false

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
        state.loading = false
        state.error = error
        return null
      }
    },
    subscribeToBlocks({ state, commit, dispatch }) {
      // ensure we never subscribe twice
      if (state.subscription) return false
      if (state.subscribedRPC === node.rpc) return false
      commit(`setSubscribedRPC`, node.rpc)

      function handleError(error) {
        dispatch(`nodeHasHalted`)
        state.error = error
      }

      node.rpc.status((error, status) => {
        if (error) return handleError(error)
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
        node.rpc.subscribe({ query: `tm.event = 'NewBlock'` }, error => {
          if (error) return handleError(error)

          if (state.subscription === false) commit(`setSubscription`, true)
        })
      })
      return true
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
