export default ({ node }) => {
  const state = {
    blockMetaInfo: { block_id: {} },
    blockHeight: null, // we remember the height so we can requery the block, if querying failed
    subscription: false,
    syncing: true,
    blockMetas: {},
    subscribedRPC: null
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
      commit("setSubscription", false)
      dispatch("subscribeToBlocks")
    },
    async queryBlockInfo({ state, commit }, height) {
      if (!height) {
        commit("notifyError", {
          title: `Couldn't query block`,
          body: "No Height Provided"
        })
        return
      }
      let blockMetaInfo = state.blockMetas[height]
      if (blockMetaInfo) {
        return blockMetaInfo
      }
      blockMetaInfo = await new Promise(resolve => {
        node.rpc.blockchain(
          { minHeight: height, maxHeight: height },
          (err, data) => {
            if (err) {
              commit("notifyError", {
                title: `Couldn't query block`,
                body: err.message
              })
              resolve(null)
            } else {
              resolve(data.block_metas && data.block_metas[0])
            }
          }
        )
      })

      commit("setBlockMetas", { ...state.blockMetas, [height]: blockMetaInfo })
      return blockMetaInfo
    },
    subscribeToBlocks({ state, commit, dispatch }) {
      // ensure we never subscribe twice
      if (state.subscription) return false
      if (state.subscribedRPC === node.rpc) return false
      commit("setSubscribedRPC", node.rpc)

      function error(err) {
        dispatch("nodeHasHalted")
        console.error(
          `Error subscribing to new blocks: ${err.message} ${err.data || ""}`
        )
      }

      node.rpc.status((err, status) => {
        if (err) return error(err)
        commit("setBlockHeight", status.sync_info.latest_block_height)
        if (status.sync_info.catching_up) {
          // still syncing, let's try subscribing again in 30 seconds
          commit("setSyncing", true)
          commit("setSubscription", false)
          setTimeout(() => dispatch("subscribeToBlocks"), 30e3)
          return false
        }

        commit("setSyncing", false)

        // only subscribe if the node is not catching up anymore
        node.rpc.subscribe({ query: "tm.event = 'NewBlock'" }, err => {
          commit("setSubscription", true)

          if (err) return error(err)
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
