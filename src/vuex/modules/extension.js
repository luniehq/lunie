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
    async checkForPresense() {
      // TODO Check if extension still installed. User could have uninstalled it.
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
