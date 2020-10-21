const { ApiPromise, WsProvider } = require('@polkadot/api')
const BaseNodeSubscription = require('./base-node-subscription')
const fetch = require('node-fetch')
const Sentry = require('@sentry/node')
const config = require('../../config.js')

// This class polls for new blocks
// Used for listening to events, such as new blocks.
class PolkadotNodeSubscription extends BaseNodeSubscription {
  constructor(network, PolkadotDataSourceClass, store, fiatValuesAPI) {
    super(network, PolkadotDataSourceClass, store, fiatValuesAPI)
  }

  async setup(network, PolkadotDataSourceClass, store) {
    await this.initPolkadotRPC(network, store)
  }

  // here we init the polkadot rpc once for all processes
  // the class gets stored in the store to be used by all instances
  async initPolkadotRPC(network, store) {
    const api = new ApiPromise({
      provider: new WsProvider(network.rpc_url || network.public_rpc_url)
    })
    store.polkadotRPC = api
    store.polkadotRPCOpened = Date.now()
    await api.isReady
    console.log(network.id + ' API initialized')
  }

  async getValidators(block, dataSource) {
    const { sessionIndex, era: currentEra } = this.store.data
    if (sessionIndex < block.sessionIndex || !sessionIndex) {
      this.store.update({
        data: {
          sessionIndex: block.sessionIndex
        }
      })
      console.log(
        `\x1b[36mCurrent session index is ${block.sessionIndex}, fetching validators!\x1b[0m`
      )
      const [validators, era] = await Promise.all([
        dataSource.getValidators(),
        dataSource.getActiveEra()
      ])
      this.store.update({
        data: {
          era
        },
        validators
      })

      if (currentEra < era || !currentEra) {
        console.log(
          `\x1b[36mCurrent staking era is ${era}, fetching rewards!\x1b[0m`
        )

        console.log(
          'Starting Polkadot rewards script on',
          config.scriptRunnerEndpoint
        )
        // runs async, we don't need to wait for this
        fetch(`${config.scriptRunnerEndpoint}/polkadotrewards`, {
          method: 'POST',
          headers: {
            Authorization: config.scriptRunnerAuthenticationToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            era,
            networkId: this.network.id
          })
        }).catch((error) => {
          console.error('Failed running Polkadot rewards script', error)
          Sentry.captureException(error)
        })
      }
    }
  }
}

module.exports = PolkadotNodeSubscription
