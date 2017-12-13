export default ({ commit, basecoin }) => {
  let state = { delegates: [] }

  const mutations = {
    addToCart (state, delegate) {
      state.delegates.push({
        id: delegate.id,
        delegate: Object.assign({}, delegate),
        atoms: 0
      })
    },
    removeFromCart (state, delegate) {
      state.delegates = state.delegates.filter(c => c.id !== delegate)
    }
  }

  return { state, mutations }
}
