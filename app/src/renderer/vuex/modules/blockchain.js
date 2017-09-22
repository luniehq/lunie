import request from 'superagent'
import requestInterval from 'request-interval'

export default ({ commit, basecoin }) => {
  const state = {
    urlPrefix: 'https://',
    blockchainName: 'sdk1',
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
      // console.log(url + '/status')
      request.get(url + '/status').end((err, res) => {
        if (err) { return console.error('err', err) }
        // console.log('status', JSON.stringify(res.body.result, null, 2))
        state.status = res.body.result
      })
    },
    getAbciInfo (state) {
      let url = state.urlPrefix + state.blockchainName + state.urlSuffix
      // console.log(url + '/abci_info')
      request.get(url + '/abci_info').end((err, res) => {
        if (err) { return console.error('err', err) }
        // console.log('abci_info', JSON.stringify(res.body.result, null, 2))
        state.abciInfo = res.body.result.response
      })
    }
  }

  requestInterval(1000, () => {
    mutations.getStatus(state)
    mutations.getAbciInfo(state)
  })

  return { state, mutations }
}
