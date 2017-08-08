import { findIndex } from 'lodash'
export default ({ commit, basecoin }) => {
  let state = { candidates: [] }

  const mutations = {
    addToCart (state, candidate) {
      state.candidates.push({
        id: candidate.id,
        candidate: Object.assign({}, candidate),
        atoms: 0
      })
      console.log(`+ ADD ${candidate.keybaseID} to cart`)
    },
    removeFromCart (state, candidate) {
      let index = findIndex(state.candidates, c => {
        return c.candidate.id === candidate
      })
      // console.log(`- RM ${JSON.stringify(state.candidates[index])} from cart[${index}]`)
      let candidates = state.candidates.slice()
      candidates.splice(index, 1)
      state.candidates = candidates
    }
  }

  return { state, mutations }
}
