const state = {
  modal: false,
  agreed: false
}

const mutations = {
  setHackAtomModal(state, value) {
    state.modal = value
    console.log("HackAtomModal set to", value)
  },
  setHackAtomAgreed(state, value) {
    state.agreed = value
    console.log("HackAtomAgreed set to", value)
  }
}

export default {
  state,
  mutations
}
