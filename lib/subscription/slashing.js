const Client = require('./rpc-client')

class SlashingMonitor {
  constructor(networkId, rpcEndpoint) {
    this.client = new Client(networkId, rpcEndpoint)
  }

  initialize() {
    this.client.call(
      'subscribe',
      {
        query: "tm.event='ValidatorSetUpdates' AND slash.reason='double_sign'"
      },
      (response) => {
        console.log(
          'Slashing event double sign (with tm.event)',
          JSON.stringify(response, null, 2)
        )
      }
    )

    this.client.call(
      'subscribe',
      {
        query:
          "tm.event='ValidatorSetUpdates' AND slash.reason='missing_signature'"
      },
      (response) => {
        console.log(
          'Slashing event missing signature (with tm.event)',
          JSON.stringify(response, null, 2)
        )
      }
    )

    this.client.call(
      'subscribe',
      { query: "slash.reason='double_sign'" },
      (response) => {
        console.log(
          'Slashing event double sign',
          JSON.stringify(response, null, 2)
        )
      }
    )

    this.client.call(
      'subscribe',
      { query: "slash.reason='missing_signature'" },
      (response) => {
        console.log(
          'Slashing event missing signature',
          JSON.stringify(response, null, 2)
        )
      }
    )

    this.client.call(
      'subscribe',
      { query: 'liveness.missed_blocks >= 1' },
      (response) => {
        console.log('Missed block', JSON.stringify(response, null, 2))
      }
    )
  }
}

module.exports = SlashingMonitor
