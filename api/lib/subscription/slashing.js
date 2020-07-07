const Tendermint = require('./tendermint')
const database = require('../database')
const config = require('../../config')

class SlashingMonitor {
  constructor(network, { api }) {
    this.network = network
    this.client = new Tendermint(
      network.id,
      network.rpc_url || network.public_rpc_url
    )
    this.api = api
  }

  // to prevent adding a slash twice we filter the slashes
  storeSlashes(filterReason) {
    return (tendermintResponse) => {
      const slashes = tendermintResponse.events['slash.address']
        .map((address, index) => ({
          networkId: this.network.id,
          operatorAddress: address,
          reason: tendermintResponse.events['slash.reason'][index],
          amount: api.reducers.coinReducer({
            amount: tendermintResponse.events['slash.power'][index],
            denom: this.network.stakingDenom
          }),
          height: tendermintResponse.height
        }))
        .filter(({ reason }) => reason === filterReason)
      database(config).upsert('slashes', slashes)
      console.log('Added', slashes.length, 'slashes')
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

    // requires some more logic to not spam the notifications if a validator is down for 1000 blocks
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
