import Vue from "vue"
import config from "src/config"

export default () => {
  const emptyState = {
    enabled: false
  }
  const state = {
    ...emptyState,
    externals: { config } // for testing
  }
  const mutations = {
    setExtensionAvailable(state, enabled) {
      Vue.set(state, "enabled", enabled)
    }
  }

  const actions = {
    async extensionPresent({ commit }, data) {
      commit(`setExtensionAvailable`, data)
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
