import noScroll from 'no-scroll'

export default ({ commit }) => {
  const state = {
    maxValidators: 100,
    activeMenu: '',
    desktop: false,
    devMode: process.env.PREVIEW !== undefined ? JSON.parse(process.env.PREVIEW) : process.env.NODE_ENV === 'development',
    // TODO: change to atom
    bondingDenom: 'fermion',
    modals: {
      error: {
        active: false
      },
      help: {
        active: false
      },
      session: {
        active: true,
        state: 'loading'
      },
      blockchain: {
        active: false
      }
    }
  }
  const mutations = {
    setDevMode (state, value) {
      state.devMode = value
    },
    setModalError (state, value) {
      state.modals.error.active = value
    },
    setModalHelp (state, value) {
      state.modals.help.active = value
    },
    setModalSession (state, value) {
      // reset modal session state if we're closing the modal
      if (value) {
        noScroll.on()
      } else {
        state.modals.session.state = 'loading'
        noScroll.off()
      }
      state.modals.session.active = value
    },
    setModalSessionState (state, value) {
      state.modals.session.state = value
    },
    setModalBlockchain (state, value) {
      state.modals.blockchain.active = value
    },
    setActiveMenu (state, value) {
      state.activeMenu = value
    },
    setConfigDesktop (state, value) {
      state.desktop = value
    }
  }
  return { state, mutations }
}
