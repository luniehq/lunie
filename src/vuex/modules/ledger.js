import config from "src/config"
import Ledger from "@lunie/cosmos-ledger"

export default () => {
  const emptyState = {}
  const state = {
    ...emptyState,
    externals: { config, Ledger } // for testing
  }
  const mutations = {}

  const actions = {
    async connectLedgerApp({ state }) {
      const ledger = new state.externals.Ledger({
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
