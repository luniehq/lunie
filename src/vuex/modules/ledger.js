import config from "src/config"
import Ledger from "scripts/ledger"

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
    },
    async confirmLedgerAddress({ state }) {
      const ledger = new state.externals.Ledger(state.externals.config)
      await ledger.confirmLedgerAddress()
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
