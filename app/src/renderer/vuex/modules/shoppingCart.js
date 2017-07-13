import { findIndex } from 'lodash'
export default ({ commit, basecoin }) => {
  const state = []

  const mutations = {
    addToCart (state, candidate) {
      state.push({
        id: candidate.id,
        candidate: Object.assign({}, candidate),
        atoms: 0
      })
      console.log(`+ ADD ${candidate.keybaseID} to cart`)
    },
    removeFromCart (state, candidate) {
      let index = findIndex(state, { id: candidate.id })
      console.log(`- RM ${JSON.stringify(state[index])} from cart[${index}]`)
      state.splice(index, 1)
    }
  }

  return { state, mutations }
}
