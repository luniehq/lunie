export default ({ commit, node }) => {
  const state = {
    urlPrefix: 'https://',
    blockchainName: 'gaia-2',
    urlSuffix: '-node0.testnets.interblock.io',
    blocks: [],
    block: {},
    blockMetaInfo: {
      block_id: {}
    },
    blockHeight: null, // we remember the height so we can requery the block, if querying failed
    blockLoading: false,
    url: ''
  }

  let url = state.urlPrefix + state.blockchainName + state.urlSuffix
  const mutations = {
    setUrl (state) {
      state.url = url
    setBlock (state, block) {
      state.block = block
    },
    setBlockMetaInfo (state, blockMetaInfo) {
      state.blockMetaInfo = blockMetaInfo
    }
  }

  const actions = {
    reconnected ({ state, dispatch }) {
      if (state.blockLoading) {
        dispatch('getBlock', state.blockHeight)
      }
    },
    async getBlock ({ state, commit }, height) {
      state.blockLoading = true
      state.blockHeight = height
      Promise.all(
        new Promise(resolve => {
          node.rpc.block({ minHeight: height, maxHeight: height }, (err, data) => {
            if (err) {
              commit('notifyError', {title: `Couldn't query block`, body: err.message})
              resolve({})
            } else {
              resolve(data.block)
            }
          })
        }).then(block => commit('setBlock', block)),
        new Promise((resolve, reject) => {
          node.rpc.blockchain({ minHeight: height, maxHeight: height }, (err, data) => {
            if (err) {
              commit('notifyError', {title: `Couldn't query block`, body: err.message})
              reject({block_id: {}})
            } else {
              resolve(data.block_metas[0])
            }
          })
        }).then(blockMetaInfo => commit('setBlockMetaInfo', blockMetaInfo))
      ).then(() => {
        state.blockLoading = false
      }, () => {
        state.blockLoading = false
      })
    }
  }

  function subscribe () {
    node.rpc.subscribe({ query: "tm.event = 'NewBlock'" }, (err, event) => {
      if (err) return console.error('error subscribing to new block headers', err)

      state.blocks.unshift(event.data.data.block)

      if (state.blocks.length === 20) {
        state.blocks.pop()
      }
    })
  }
  subscribe()

  setTimeout(() => {
    mutations.getStatus(state)
    mutations.getAbciInfo(state)
    mutations.setUrl(state)
  }, 3000)

  return { state, mutations, actions }
}
