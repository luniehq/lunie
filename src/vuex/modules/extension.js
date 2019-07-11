import config from "src/config"
import { getAccountsFromExtension } from "src/scripts/extension-utils"

export default () => {
  const emptyState = {
    enabled: false
  }
  const state = {
    ...emptyState,
    accounts: [],
    externals: { config, getAccountsFromExtension } // for testing
  }
  const mutations = {
    setExtensionAvailable(state) {
      state.enabled = true
    },
    setExtensionAccounts(state, accounts) {
      state.accounts = accounts
    }
  }

  const actions = {
    async getAddressesFromExtension({
      state: {
        externals: { getAccountsFromExtension }
      }
    }) {
      getAccountsFromExtension()
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
