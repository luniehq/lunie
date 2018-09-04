import noScroll from "no-scroll"

export default () => {
  const emptyState = {
    maxValidators: 100,
    activeMenu: "",
    desktop: false,
    devMode:
      process.env.PREVIEW !== undefined
        ? JSON.parse(process.env.PREVIEW)
        : process.env.NODE_ENV === "development",
    // TODO: change to atom
    bondingDenom: "Steak",
    modals: {
      error: { active: false },
      help: { active: false },
      receive: { active: false },
      session: {
        active: true,
        state: "loading"
      },
      noNodes: { active: false },
      nodeHalted: { active: false }
    }
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setDevMode(state, value) {
      state.devMode = value
    },
    setModalError(state, value) {
      state.modals.error.active = value
    },
    setModalErrorMessage(state, message) {
      state.modals.error.message = message
    },
    setModalHelp(state, value) {
      state.modals.help.active = value
    },
    setModalReceive(state, value) {
      state.modals.receive.active = value
    },
    setModalSession(state, value) {
      // reset modal session state if we're closing the modal
      if (value) {
        noScroll.on()
      } else {
        state.modals.session.state = "loading"
        noScroll.off()
      }
      state.modals.session.active = value
    },
    setModalSessionState(state, value) {
      state.modals.session.state = value
    },
    setModalNoNodes(state, value) {
      state.modals.noNodes.active = value
    },
    setModalNodeHalted(state, value) {
      state.modals.nodeHalted.active = value
    },
    setActiveMenu(state, value) {
      state.activeMenu = value
    },
    setConfigDesktop(state, value) {
      state.desktop = value
    }
  }
  const actions = {
    resetSessionData({ rootState }) {
      rootState.config = JSON.parse(JSON.stringify(emptyState))
    }
  }
  return { state, mutations, actions }
}
