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
    async connectLedgerApp({ state, commit }) {
      const ledger = new state.externals.Ledger({
        ...state.externals.config,
        onOutdated: () => {
          // DEPRECATION disable and turn into a block to use ledger around end of may
          commit("notifyWarn", {
            title: "Ledger Cosmos App Outdated",
            body:
              "Your Ledger Cosmos App version is going to be deprecated. Please update to the lastest app version using Ledger Live."
          })
        }
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
