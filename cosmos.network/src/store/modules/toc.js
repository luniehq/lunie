const state = {
  faq: {
    elementsVisible: [],
    tocVisible: false
  },
  whitepaper: {
    elementsVisible: [],
    tocVisible: false
  }
}

const mutations = {
  setElementsVisible(state, { id, els }) {
    state[id].elementsVisible = els
  },
  setTocVisible(state, { id, visible }) {
    state[id].tocVisible = visible
  }
}

export default {
  state,
  mutations
}
