import config from "src/../config"

export default () => {
  const emptyState = {}
  const state = {
    ...emptyState,
    externals: { config } // for testing
  }
  const mutations = {}

  const actions = {
    async connectLedgerApp({ state }) {
      const { default: Ledger } = await import("@lunie/cosmos-ledger")

      const ledger = new Ledger({
        testModeAllowed: state.externals.config.testModeAllowed
      })

      let address
      try {
        address = await ledger.getCosmosAddress()
      } catch (err) {
        /* istanbul ignore next: specific error rewrite */
        if (err.message.trim().startsWith("Device is already open")) {
          throw new Error(
            "Something went wrong connecting to your Ledger. Please refresh your page and try again."
          )
        }
        throw err
      }

      // cleanup. if we leave this open, the next connection will brake for HID
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
