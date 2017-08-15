import request from 'superagent'
import requestInterval from 'request-interval'

export default ({ commit, basecoin }) => {
  const state = {
    blockchainName: 'mercury',
    validators: {}
  }

  const mutations = {
    setValidatorBlockchainName (state, name) {
      state.blockchainName = name
    },
    setValidatorIpData (state, validator, data) {
      state.validators
    }
  }

  function moniker01 () {
    let moniker = ''
    switch (state.blockchainName) {
      case 'mercury':
        moniker = '46.101.123.204'; break
      case 'hermes':
        moniker = '139.59.157.211'; break
      case 'venus':
        moniker = '207.154.246.77'; break
    }
    return moniker
  }

  // let moniker01mercury = '46.101.123.204'
  // let moniker01 = '139.59.157.211'

  function n (network, x) {
    return `https://${state.blockchainName}-node${x}.testnets.interblock.io`
  }

  function getValidators () {
    // retrieve peer validators (of validator01)
    request.get(n('mercury', 2) + '/net_info').end((err, res) => {
      if (err) console.error(err)

      let validators = res.body.result.peers

      // filter out validators that aren't currently running
      validators = validators.filter(v => v.connection_status.SendMonitor.CurRate !== 0)

      getValidator1(validators)
    })
  }

  function getValidator1 (validators) {
    // retrieve validator details (of validator01)
    request.get(n('mercury', 0) + '/net_info').end((err, res) => {
      if (err) console.error(err)

      // filter out the redundant nodes
      let validator01 = res.body.result.peers.find(
        p => p.node_info.moniker === moniker01())

      // combine validator list
      validators.push(validator01)

      state.validators = validators
    })
  }

  requestInterval(1000, () => getValidators())

  return { state, mutations }
}
