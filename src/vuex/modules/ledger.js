import config from "src/config"

export default () => {
  const emptyState = {}
  const state = {
    ...emptyState,
    externals: { config } // for testing
  }
  const mutations = {}

  const actions = {
    async connectLedgerApp({ state }) {
      const Ledger = await import("@lunie/cosmos-ledger")

      const ledger = new Ledger({
        testModeAllowed: state.externals.config.testModeAllowed
      })

      return await ledger.getCosmosAddress()
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
