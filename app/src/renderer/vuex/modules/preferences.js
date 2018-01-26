const Store = require('electron-store')
const store = new Store()

export default () => {
  const state = {
    savedAccountName: store.get('savedAccountName')
  }

  const mutations = {
    setSavedAccountName (state, name) {
      state.savedAccountName = name
      store.set('savedAccountName', name)
    }
  }

  return { state, mutations }
}
