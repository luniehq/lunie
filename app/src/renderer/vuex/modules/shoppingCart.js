import { findIndex } from 'lodash'
export default ({ commit, basecoin }) => {
  const state = []

  const mutations = {
    addToCart (state, candidateId) {
      state.push({
        candidateId: candidateId,
        atoms: 0
      })
      console.log(`+ ADD ${candidateId} to cart`)
    },
    removeFromCart (state, candidateId) {
      let index = findIndex(state, { 'candidateId': candidateId })
      console.log(`- RM ${JSON.stringify(state[index])} from cart[${index}]`)
      state.splice(index, 1)
    }
  }

  return { state, mutations }
}
