const Tendermint = require('./tendermint')

class SlashingMonitor {
  constructor(networkId, rpcEndpoint) {
    this.client = new Tendermint(networkId, rpcEndpoint)
  }

  initialize() {
    this.client.subscribe(
      { query: "slash.reason='double_sign'" },
      (response) => {
        console.log(
          'Slashing event double sign',
          JSON.stringify(response, null, 2)
        )
      }
    )

    this.client.subscribe(
      { query: "slash.reason='missing_signature'" },
      (response) => {
        console.log(
          'Slashing event missing signature',
          JSON.stringify(response, null, 2)
        )
      }
    )

    this.client.subscribe(
      { query: 'liveness.missed_blocks >= 1' },
      (response) => {
        const missedBlocks = response.events['liveness.address'].map(
          (address, index) => ({
            validator: address,
            missedBlocks: response.events['liveness.missed_blocks'][index]
          })
        )
        console.log('Missed block', missedBlocks)
      }
    )
  }
}

module.exports = SlashingMonitor
