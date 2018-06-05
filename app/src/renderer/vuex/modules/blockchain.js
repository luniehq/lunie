import { getTxHash } from "../../scripts/tx-utils.js"

export default ({ commit, node }) => {
  const state = {
    blocks: [],
    block: {},
    blockMetaInfo: { block_id: {} },
    blockHeight: null, // we remember the height so we can requery the block, if querying failed
    blockLoading: false,
    subscription: false,
    syncing: true,
    blockMetas: {},
    blockTxs: {}
  }

  const mutations = {
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
      dispatch("subscribeToBlocks")
    },
    async getBlock({ state, commit, dispatch }, height) {
      try {
        state.blockLoading = true
        state.blockHeight = height
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
    queryBlock({ state, commit }, height) {
      return new Promise((resolve, reject) => {
        node.rpc.block({ height }, (err, data) => {
          if (err) {
            commit("notifyError", {
              title: `Couldn't query block`,
              body: err.message
            })
            resolve({})
          } else {
            resolve(data.block)
          }
        })
      })
    },
    async queryTxInfo({ state, dispatch, commit }, height) {
      if (!height) {
        commit("notifyError", {
          title: `Couldn't query tx`,
          body: "No Height Provided"
        })
        return Promise.resolve()
      }
      let blockTxInfo = state.blockTxs[height]
      if (blockTxInfo) {
        return blockTxInfo
      }
      try {
        blockTxInfo = await dispatch("getTxs", {
          key: 0,
          len:
            state.block && state.block.data && state.block.data.txs
              ? state.block.data.txs.length
              : 0,
          txs:
            state.block && state.block.data && state.block.data.txs
              ? state.block.data.txs.slice(0)
              : []
        })
        state.blockTxs[height] = blockTxInfo
        return blockTxInfo
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async getTxs({ state, commit, dispatch }, { key, len, txs }) {
      //  this function is recursice promie used as an async loop in order to query all tx
      // found in a block. it's made similarly to queryBlockInfo only there
      // is more than one async call to make. the txstring is included but might not
      // actually be useful. etherscan.io includes something similar but it's seldom helpful
      try {
        if (key >= len) return txs
        let txstring = atob(txs[key])
        let hash = await getTxHash(txs[key])
        let data = await node.txs(hash)
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
        return Promise.resolve()
      }
      let blockMetaInfo = state.blockMetas[height]
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
              resolve(data.block_metas.length ? data.block_metas[0] : null)
            }
          }
        )
      })
      state.blockMetas[height] = blockMetaInfo
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
