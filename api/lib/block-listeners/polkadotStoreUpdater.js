const StoreUpdater = require("./storeUpdater")
const config = require("../../config")

class PolkadotStoreUpdater extends StoreUpdater {
    updateValidators(block, api) {
        // We dont need to fetch validators on every new block.
      // Validator list only changes on new sessions
      if (
        this.currentSessionIndex < block.sessionIndex ||
        this.currentSessionIndex === 0
      ) {
        console.log(
          `\x1b[36mCurrent session index is ${block.sessionIndex}, fetching validators!\x1b[0m`
        )
        this.currentSessionIndex = block.sessionIndex
        const [sessionValidators, era] = await Promise.all([
          api.getAllValidators(),
          api.getEra()
        ])
        this.sessionValidators = sessionValidators

        if (this.currentEra < era || this.currentEra === 0) {
          console.log(
            `\x1b[36mCurrent staking era is ${era}, fetching rewards!\x1b[0m`
          )
          this.currentEra = era

          this.triggerRewardsFetching(era)
        }
      }
    }

    triggerRewardsFetching(era) {
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

module.exports = PolkadotStoreUpdater