export default ({ commit, basecoin }) => {
  const state = {
    INVITE_TOKENS_MAX: 10,
    CANDIDATE: {
      KEYBASE_MIN: 2,
      KEYBASE_MAX: 16,
      DESCRIPTION_MIN: 20,
      DESCRIPTION_MAX: 40000,
      COMMISSION_MIN: 0,
      COMMISSION_MAX: 99,
      SELF_BOND_MIN: 100,
      SELF_BOND_MAX: 1e10
    },
    activeMenu: '',
    blockchainSelect: false,
    desktop: false,
    modals: {
      help: {
        active: false
      }
    }
  }
  const mutations = {
    setModalHelp (state, value) {
      state.modals.help.active = value
    },
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
  return { state, mutations }
}
