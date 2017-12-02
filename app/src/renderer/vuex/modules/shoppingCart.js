export default ({ commit, basecoin }) => {
  let state = { candidates: [] }

  const mutations = {
    addToCart (state, candidate) {
      state.candidates.push({
        id: candidate.id,
        candidate: Object.assign({}, candidate),
        atoms: 0
      })
    },
    removeFromCart (state, candidate) {
      state.candidates = state.candidates.filter(c => c.id !== candidate)
    }
  }

  return { state, mutations }
}
