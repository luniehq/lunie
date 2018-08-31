export default ({ node }) => {
  const state = {
    blocks: [],
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
    },
    unshiftBlock(state, block) {
      state.blocks.unshift(block)
    },
    popBlock(state) {
      state.blocks.pop()
    }
  }

  const actions = {
    reconnected({ commit, dispatch }) {
      // see note below regarding getBlock etc
      // if (state.blockLoading) {
      //   dispatch("getBlock", state.blockHeight)
      // }
      //on a reconnect we assume, that the rpc connector changed, so we can safely resubscribe to blocks
      commit("setSubscription", false)
      dispatch("subscribeToBlocks")
    },
    // getBlock, queryBlock, queryTxInfo & getTxs are no longer used after the block explorer was moved
    // out of voyager. Keeping them here for now in case they are needed again.
    // async getBlock({ state, commit, dispatch }, height) {
    //   try {
    //     state.blockLoading = true
    //     commit("setBlockHeight", height)
    //
    //     const [block, blockMetaInfo] = await Promise.all([
    //       dispatch("queryBlock", height),
    //       dispatch("queryBlockInfo", height)
    //     ])
    //     commit("setBlock", block)
    //     commit("setBlockMetaInfo", blockMetaInfo)
    //     state.blockLoading = false
    //     const blockTxInfo = await dispatch("queryTxInfo", height)
    //     commit("setBlockTxInfo", blockTxInfo)
    //   } catch (error) {
    //     state.blockLoading = false
    //     return Promise.reject(error)
    //   }
    // },
    // queryBlock({ commit }, height) {
    //   return new Promise(resolve => {
    //     node.rpc.block({ height: height && height.toString() }, (err, data) => {
    //       if (err) {
    //         commit("notifyError", {
    //           title: `Couldn't query block`,
    //           body: err.message
    //         })
    //         resolve(null)
    //       } else {
    //         resolve(data.block)
    //       }
    //     })
    //   })
    // },
    // async queryTxInfo({ state, dispatch }, height) {
    //   if (!height || !state.block) {
    //     return {}
    //   }
    //   let blockTxInfo = state.blockTxs[height]
    //   if (blockTxInfo) {
    //     return blockTxInfo
    //   }
    //   blockTxInfo = await dispatch("getTxs", {
    //     key: 0,
    //     len: state.block.data.txs ? state.block.data.txs.length : 0,
    //     txs: state.block.data.txs ? state.block.data.txs.slice(0) : []
    //   })
    //   state.blockTxs = { ...state.blockTxs, [height]: blockTxInfo }
    //   return blockTxInfo
    // },
    // async getTxs({ commit, dispatch }, { key, len, txs }) {
    //   //  this function queries txs recursively. it's called from queryTxInfo as series of synchronous
    //   // calls. it could also be called as a Promise.all to make the calls asynchronous but block with
    //   // many transactions might overload the tx endpoint with too many simultaneous calls.
    //   try {
    //     if (key >= len) return txs
    //     let txstring = atob(txs[key])
    //     let hash = await getTxHash(txs[key])
    //     let data = await node.tx(hash)
    //     data.string = txstring
    //     data.time =
    //       state.blockMetas[data.height] &&
    //       state.blockMetas[data.height].header.time
    //     txs[key] = data
    //     return await dispatch("getTxs", { key: key + 1, len, txs })
    //   } catch (error) {
    //     commit("notifyError", {
    //       title: `Couldn't query block`,
    //       body: error.message
    //     })
    //     return Promise.reject(error)
    //   }
    // },
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
        node.rpc.subscribe({ query: "tm.event = 'NewBlock'" }, (err, event) => {
          commit("setSubscription", true)

          if (err) return error(err)
          commit("unshiftBlock", event.data.value.block)

          if (state.blocks.length === 20) {
            commit("popBlock")
          }
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
