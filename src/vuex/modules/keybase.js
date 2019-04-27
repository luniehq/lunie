import axios from "axios"
import moment from "moment"

export default () => {
  const emptyState = {
    identities: {},
    loading: false,
    loaded: false,
    error: null
  }
  const state = JSON.parse(JSON.stringify(emptyState))
  state.externals = {
    axios,
    moment
  }
  // prepopulating the keybase cache. The cache is build on every build.
  // This mitigates the problem of the keybase API rate limiting users and therefor
  // users not being able to see profile pictures.
  const cache = require(`src/keybase-cache.json`)
  const localCache = localStorage.getItem(`keybaseCache`)
  state.identities = localCache ? JSON.parse(localCache) : cache

  const mutations = {
    setKeybaseIdentities(state, identities) {
      identities.forEach(identity => {
        state.identities[identity.keybaseId] = identity
      })
    }
  }

  const actions = {
    async getKeybaseIdentity({ state }, keybaseId) {
      if (!/.{16}/.test(keybaseId)) return // the keybase id is not correct

      const lastUpdatedBefore2Minutes = state.identities[keybaseId]
        && state.externals.moment(state.identities[keybaseId].lastUpdated)
          .diff(state.externals.moment(), `minutes`)
          <= -2

      // if we don't have the identity or we have checked but didn't found it 2 minutes ago we query the identity
      if (
        !state.identities[keybaseId]
        || (!state.identities[keybaseId].userName && lastUpdatedBefore2Minutes)
      ) {
        return lookupId(state, keybaseId)
      }

      const lastUpdatedBefore1Day = state.identities[keybaseId]
        && state.externals.moment(state.identities[keybaseId].lastUpdated)
          .diff(state.externals.moment(), `days`)
          <= -1

      if (state.identities[keybaseId]) { // we already have this identity
        // check if the last check is more then 1 days ago to refresh
        if (lastUpdatedBefore1Day) {
          // as a recommendation by keybase we should prefer looking up profiles by username
          return lookupUsername(
            state, keybaseId,
            state.identities[keybaseId].userName
          )
        }

        return state.identities[keybaseId]
      }
    },
    async getKeybaseIdentities({ dispatch, commit, state }, validators) {
      state.loading = true
      const identities = await Promise.all(
        validators.map(async validator => {
          if (validator.description.identity) {
            return dispatch(
              `getKeybaseIdentity`,
              validator.description.identity
            )
          }
        })
      )
      state.error = null
      state.loading = false
      state.loaded = true
      commit(`setKeybaseIdentities`, identities.filter(x => !!x))

      // cache keybase identities even when not logged in
      localStorage.setItem(`keybaseCache`, JSON.stringify(state.identities))
    }
  }

  return {
    state,
    actions,
    mutations
  }
}

const baseUrl = `https://keybase.io/_/api/1.0/user/lookup.json`
const fieldsQuery = `fields=pictures,basics`

export async function lookupId(state, keybaseId) {
  const fullUrl = `${baseUrl}?key_suffix=${keybaseId}&${fieldsQuery}`
  return query(state, fullUrl, keybaseId)
}

async function lookupUsername(state, keybaseId, username) {
  const fullUrl = `${baseUrl}?usernames=${username}&${fieldsQuery}`
  return query(state, fullUrl, keybaseId)
}

async function query(state, url, keybaseId) {
  try {
    const json = await state.externals.axios(url)
    if (json.data.status.name === `OK`) {
      const user = json.data.them[0]
      if (user) {
        return {
          keybaseId,
          avatarUrl: user.pictures && user.pictures.primary
            ? user.pictures.primary.url
            : undefined,
          userName: user.basics.username,
          profileUrl: `https://keybase.io/` + user.basics.username,
          lastUpdated: new Date(Date.now()).toUTCString()
        }
      }
    }
  } catch (error) {
    return {
      keybaseId
    }
  }
}
