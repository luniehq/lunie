import config from "src/config"
import { getAccounts } from "src/scripts/extension-utils"

export default () => {
  const emptyState = {
    enabled: false
  }
  const state = {
    ...emptyState,
    accounts: [],
    externals: { config, getAccounts } // for testing
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
        externals: { getAccounts }
      }
    }) {
      getAccounts() // response will be handled by extension message listener
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
