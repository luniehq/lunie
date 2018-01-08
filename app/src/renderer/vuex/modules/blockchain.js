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
      console.log(url + '/status')
      axios(url + '/status').then((err, res) => {
        if (err) {
          return console.error('err', err)
        }
        console.log('status', JSON.stringify(res.body.result, null, 2))
        state.status = res.body.result
      })
    },
    getAbciInfo (state) {
      let url = state.urlPrefix + state.blockchainName + state.urlSuffix
      console.log(url + '/abci_info')
      axios(url + '/abci_info').then((err, res) => {
        if (err) {
          return console.error('err', err)
        }
        console.log('abci_info', JSON.stringify(res.body.result, null, 2))
        state.abciInfo = res.body.result.response
      })
    }
  }

  return { state, mutations }
}
