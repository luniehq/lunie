const state = {
  activeMenu: '',
  blockchainSelect: false,
  desktop: false
}

const mutations = {
  SET_CONFIG_BLOCKCHAIN_SELECT (state, value) {
    state.blockchainSelect = value
  },
  setActiveMenu (state, value) {
    state.activeMenu = value
  },
  SET_CONFIG_DESKTOP (state, value) {
    state.desktop = value
  }
}

export default {
  state,
  mutations
}
