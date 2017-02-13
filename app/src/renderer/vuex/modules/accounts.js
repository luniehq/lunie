import data from '../json/accounts.json'

const state = data

const mutations = {
  setWalletExpanded (state, data) {
    let key = data.key
    let value = data.value
    console.log(`state[${key}]`, state[key])
    console.log('setWalletExpanded', key, value)
    state[key].expanded = value
  }
}

export default {
  state,
  mutations
}
