export default () => {
  const emptyState = {
    identities: {},
    loading: false,
    loaded: false,
    error: null
  }
  const state = JSON.parse(JSON.stringify(emptyState))
  // prepopulating the keybase cache. The cache is build on every build.
  // This mitigates the problem of the keybase API rate limiting users and therefor
  // users not being able to see profile pictures.
  const cache = require(`src/keybase-cache.json`)
  const localCache = localStorage.getItem(`keybaseCache`)
  state.identities = localCache ? JSON.parse(localCache) : cache
  state.loaded = true

  const mutations = {}

  const actions = {}

  return {
    state,
    actions,
    mutations
  }
}
