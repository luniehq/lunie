import axios from 'axios'

export default ({ commit }) => {
  const state = {
    urlPrefix: 'https://',
    blockchainName: 'gaia-2-dev',
    urlSuffix: '-node0.testnets.interblock.io',
    status: {},
    abciInfo: {},
    topAvgTxRate: 0
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

  setTimeout(() => {
    mutations.getStatus(state)
    mutations.getAbciInfo(state)
  }, 3000)

  return { state, mutations }
}
