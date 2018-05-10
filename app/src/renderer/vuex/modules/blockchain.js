export default ({ commit, node }) => {
  const state = {
    blocks: [],
    block: {},
    blockMetaInfo: { block_id: {} },
    blockHeight: null, // we remember the height so we can requery the block, if querying failed
    blockLoading: false,
    subscription: false,
    syncing: true,
    blockMetas: []
  }

  const mutations = {
    setBlock(state, block) {
      state.block = block
    },
    setBlockMetaInfo(state, blockMetaInfo) {
      state.blockMetaInfo = blockMetaInfo
    }
  }

  const actions = {
    reconnected({ state, dispatch }) {
      if (state.blockLoading) {
        dispatch("getBlock", state.blockHeight)
      }
      dispatch("subscribeToBlocks")
    },
    async getBlock({ state, commit, dispatch }, height) {
      state.blockLoading = true
      state.blockHeight = height
      return Promise.all([
        dispatch("queryBlock", height).then(block => commit("setBlock", block)),
        dispatch("queryBlockInfo", height).then(blockMetaInfo =>
          commit("setBlockMetaInfo", blockMetaInfo)
        )
      ]).then(
        () => {
          state.blockLoading = false
        },
        () => {
          state.blockLoading = false
        }
      )
    },
    async queryBlock({ state, commit }, height) {
      return new Promise(resolve => {
        node.rpc.block(
          { minHeight: height, maxHeight: height },
          (err, data) => {
            if (err) {
              commit("notifyError", {
                title: `Couldn't query block`,
                body: err.message
              })
              resolve({})
            } else {
              resolve(data.block)
            }
          }
        )
      })
    },
    async queryBlockInfo({ state, commit }, height) {
      let blockMetaInfo = state.blockMetas.find(b => b.header.height === height)
      if (blockMetaInfo) {
        return blockMetaInfo
      }
      blockMetaInfo = await new Promise((resolve, reject) => {
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
              resolve(data.block_metas[0])
            }
          }
        )
      })
      blockMetaInfo && state.blockMetas.push(blockMetaInfo)
      return blockMetaInfo
    },
    subscribeToBlocks({ state, commit, dispatch }) {
      // ensure we never subscribe twice
      if (state.subscription) return

      function error(err) {
        state.subscription = false
        commit("notifyError", {
          title: `Error subscribing to new blocks`,
          body: err.message
        })
      }

      node.rpc.status((err, status) => {
        if (err) return error(err)

        if (status.syncing) {
          // still syncing, let's try subscribing again in 30 seconds
          state.syncing = true
          state.subscription = false
          setTimeout(() => dispatch("subscribeToBlocks"), 30e3)
          return
        }

        state.syncing = false

        node.rpc.subscribe({ query: "tm.event = 'NewBlock'" }, (err, event) => {
          state.subscription = true

          if (err) return error(err)

          state.blocks.unshift(event.data.value.block)

          if (state.blocks.length === 20) {
            state.blocks.pop()
          }
        })
      })
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
