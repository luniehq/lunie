import axios from 'axios'

export default ({ commit, node }) => {
  const state = {
    urlPrefix: 'https://',
    blockchainName: 'gaia-2-dev',
    urlSuffix: '-node0.testnets.interblock.io',
    status: {},
    abciInfo: {},
    topAvgTxRate: 0,
    blocks: []
  }

  const mutations = {
    setBlockchainName (state, name) {
      state.blockchainName = name
    },
    setTopAvgTxRate (state, value) {
      state.topAvgTxRate = value
    },
    getStatus (state) {
      let url = state.urlPrefix + state.blockchainName + state.urlSuffix
      axios(url + '/status').then((res) => {
        state.status = res.data.result
      })
    },
    getAbciInfo (state) {
      let url = state.urlPrefix + state.blockchainName + state.urlSuffix
      axios(url + '/abci_info').then((res) => {
        state.abciInfo = res.data.result
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
  }, 3000)

  return { state, mutations }
}
