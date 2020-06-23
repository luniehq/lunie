const Tendermint = require('./tendermint')
const database = require('../database')
const config = require('../../config')

class SlashingMonitor {
  constructor(networkId, rpcEndpoint, store) {
    this.networkId = networkId
    this.client = new Tendermint(networkId, rpcEndpoint)
    this.store = store
  }

  // to prevent adding a slash twice we filter the slashes
  storeSlashes(filterReason) {
    return (tendermintResponse) => {
      const slashes = tendermintResponse.events['slash.address'].map(
        (address, index) => ({
          networkId: this.networkId,
          operatorAddress: address,
          reason: tendermintResponse.events['slash.reason'][index],
          amount: tendermintResponse.events['slash.power'][index],
          height: tendermintResponse.height
        })
      ).filter(({reason}) => reason === filterReason)
      database(config).upsert('slashes', slashes)
      console.log("Added", slashes.length, "slashes")
    }
  }

  initialize() {
    this.client.subscribe(
      { query: "slash.reason='double_sign'" },
      this.storeSlashes('double_sign')
    )

    this.client.subscribe(
      { query: "slash.reason='missing_signature'" },
      this.storeSlashes('missing_signature')
    )

    // this.client.subscribe(
    //   { query: 'liveness.missed_blocks >= 1' },
    //   (response) => {
    //     const missedBlocks = response.events['liveness.address'].map(
    //       (address, index) => ({
    //         operatorAddress: address,
    //         missedBlocks: response.events['liveness.missed_blocks'][index],
    //         height: response.height
    //       })
    //     )
    //     console.log('Missed block', missedBlocks)
    //   }
    // )
  }
}

module.exports = SlashingMonitor
