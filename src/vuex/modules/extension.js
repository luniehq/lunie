import Vue from "vue"
import config from "src/config"
import { getWallets } from "src/scripts/extension-utils"

export default () => {
  const emptyState = {
    enabled: false
  }
  const state = {
    ...emptyState,
    wallets: [],
    externals: { config, getWallets } // for testing
  }
  const mutations = {
    setExtensionAvailable(state, enabled) {
      Vue.set(state, "enabled", enabled)
    },
    setWallets(state, wallets) {
      Vue.set(state, "wallets", wallets)
    }
  }

  const actions = {
    async getAddressesFromExtension({
      state: {
        externals: { getWallets }
      }
    }) {
      getWallets()
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
