import config from "src/config"
import { getWalletsFromExtension } from "src/scripts/extension-utils"

export default () => {
  const emptyState = {
    enabled: false
  }
  const state = {
    ...emptyState,
    accounts: [],
    externals: { config, getWalletsFromExtension } // for testing
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
        externals: { getWalletsFromExtension }
      },
      commit
    }) {
      const wallets = await getWalletsFromExtension()
      commit("setExtensionAccounts", wallets)
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
