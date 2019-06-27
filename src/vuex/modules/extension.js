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
    externals: { config } // for testing
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
    async checkForPresense() {
      // TODO Check if extension still installed. User could have uninstalled it.
    },
    async signWithExtension({ state, commit }, { stdTx, senderAddress }) {
      // TODO
    },
    async getAddressesFromExtension() {
      getWallets()
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
