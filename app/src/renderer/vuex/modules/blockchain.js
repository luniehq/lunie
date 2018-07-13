import { getTxHash } from "../../scripts/tx-utils.js"

export default ({ node }) => {
  const state = {
    blocks: [],
    block: null,
    blockMetaInfo: { block_id: {} },
    blockHeight: null, // we remember the height so we can requery the block, if querying failed
    blockLoading: false,
    subscription: false,
    syncing: true,
    blockMetas: {},
    blockTxs: {}
  }

  const mutations = {
    setBlockHeight(state, height) {
      state.blockHeight = height
    },
    setBlocks(state, blocks) {
      state.blocks = blocks
    },
    setBlock(state, block) {
      state.block = block
    },
    setBlockMetaInfo(state, blockMetaInfo) {
      state.blockMetaInfo = blockMetaInfo
    },
    setBlockTxInfo(state, blockTxInfo) {
      state.blockTxInfo = blockTxInfo
    }
  }

  const actions = {
    reconnected({ state, dispatch }) {
      if (state.blockLoading) {
        dispatch("getBlock", state.blockHeight)
      }
      //on a reconnect we assume, that the rpc connector changed, so we can safely resubscribe to blocks
      state.subscription = false
      dispatch("subscribeToBlocks")
    },
    async getBlock({ state, commit, dispatch }, height) {
      try {
        state.blockLoading = true
        commit("setBlockHeight", height)

        const [block, blockMetaInfo] = await Promise.all([
          dispatch("queryBlock", height),
          dispatch("queryBlockInfo", height)
        ])
        commit("setBlock", block)
        commit("setBlockMetaInfo", blockMetaInfo)
        state.blockLoading = false
        const blockTxInfo = await dispatch("queryTxInfo", height)
        commit("setBlockTxInfo", blockTxInfo)
      } catch (error) {
        state.blockLoading = false
        return Promise.reject(error)
      }
    },
    queryBlock({ commit }, height) {
      return new Promise(resolve => {
        node.rpc.block({ minHeight: height, height }, (err, data) => {
          // the mock /block looks for minHeight but the live /block looks for height
          if (err) {
            commit("notifyError", {
              title: `Couldn't query block`,
              body: err.message
            })
            resolve(null)
          } else {
            resolve(data.block)
          }
        })
      })
    },
    async queryTxInfo({ state, dispatch }, height) {
      if (!height || !state.block) {
        return {}
      }
      let blockTxInfo = state.blockTxs[height]
      if (blockTxInfo) {
        return blockTxInfo
      }
      blockTxInfo = await dispatch("getTxs", {
        key: 0,
        len: state.block.data.txs ? state.block.data.txs.length : 0,
        txs: state.block.data.txs ? state.block.data.txs.slice(0) : []
      })
      state.blockTxs = { ...state.blockTxs, [height]: blockTxInfo }
      return blockTxInfo
    },
    async getTxs({ commit, dispatch }, { key, len, txs }) {
      //  this function queries txs recursively. it's called from queryTxInfo as series of synchronous
      // calls. it could also be called as a Promise.all to make the calls asynchronous but block with
      // many transactions might overload the tx endpoint with too many simultaneous calls.
      try {
        if (key >= len) return txs
        let txstring = atob(txs[key])
        let hash = await getTxHash(txs[key])
        let data = await node.tx(hash)
        data.string = txstring
        txs[key] = data
        return await dispatch("getTxs", { key: key + 1, len, txs })
      } catch (error) {
        commit("notifyError", {
          title: `Couldn't query block`,
          body: error.message
        })
        return Promise.reject(error)
      }
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
              resolve(data.block_metas ? data.block_metas[0] : null)
            }
          }
        )
      })
      state.blockMetas = { ...state.blockMetas, [height]: blockMetaInfo }
      return blockMetaInfo
    },
    subscribeToBlocks({ state, commit, dispatch }) {
      // ensure we never subscribe twice
      if (state.subscription) return

      function error(err) {
        state.subscription = false
        dispatch("nodeHasHalted")
        console.error(`Error subscribing to new blocks: ${err.message}`)
      }

      node.rpc.status((err, status) => {
        if (err) return error(err)
        commit("setBlockHeight", status.latest_block_height)
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
