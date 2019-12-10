import config from "src/../config"

export default () => {
  const emptyState = {}
  const state = {
    ...emptyState,
    externals: { config } // for testing
  }
  const mutations = {}

  const actions = {
    async connectLedgerApp({ state }, network) {
      const ledger = await getLedgerConnector(state.externals.config, network)

      let address
      try {
        address = await ledger.getCosmosAddress() // TODO this should become `getAddress` to also work for not Cosmos networks
      } catch (err) {
        // TODO move this error rewrite into the ledger lib
        /* istanbul ignore next: specific error rewrite */
        if (err.message.trim().startsWith("Device is already open")) {
          throw new Error(
            "Something went wrong connecting to your Ledger. Please refresh your page and try again."
          )
        }
        throw err
      }

      // cleanup. if we leave this open, the next connection will brake for HID
      // TODO move this into the leder lib
      ledger.cosmosApp.transport.close()

      return address
    }
  }
  return {
    state,
    mutations,
    actions
  }
}

async function getLedgerConnector(config, network) {
  switch (network) {
    case "cosmos-hub-mainnet":
    case "cosmos-hub-testnet":
    case "regen-testnet":
    case "regen-mainnet":
    case "terra-testnet":
    case "terra-mainnet": {
      const { default: Ledger } = await import("@lunie/cosmos-ledger")

      const ledger = new Ledger({
        testModeAllowed: config.testModeAllowed,
        hrp: config.bech32Prefixes[network]
      })

      return ledger
    }
    default:
      throw new Error(
        "Lunie doesn't support connecting to the Ledger for this network."
      )
  }
}
