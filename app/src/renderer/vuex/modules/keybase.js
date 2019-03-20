import axios from "axios"
import moment from "moment"
import * as Sentry from "@sentry/browser"

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

  const mutations = {
    setKeybaseIdentities(state, identities) {
      identities.forEach(identity => {
        state.identities[identity.keybaseId] = Object.assign({}, identity, {
          lastUpdated: new Date(Date.now()).toUTCString()
        })
      })
    }
  }

  const actions = {
    async getKeybaseIdentity({ state }, keybaseId) {
      if (!/.{16}/.test(keybaseId)) return // the keybase id is not correct
      if (state.identities[keybaseId]) { // we already have this identity
        // check if the last check is more then 2 days ago
        if (state.externals.moment(state.identities[keybaseId].lastUpdated).diff(state.externals.moment(), `days`) <= -2) {
          // as a recommendation by keybase we should prefer looking up profiles by username
          return lookupUsername(
            state, keybaseId,
            state.identities[keybaseId].userName
          )
        }

        return state.identities[keybaseId]
      }

      return lookupId(state, keybaseId)
    },
    async getKeybaseIdentities({ dispatch, commit, state }, validators) {
      try {
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
      } catch (error) {
        Sentry.captureException(error)
        state.error = error
      }
    }
  }

  return {
    state,
    actions,
    mutations
  }
}

async function lookupId(state, keybaseId) {
  const urlPrefix = `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=`
  const fullUrl = urlPrefix + keybaseId
  const json = await state.externals.axios(fullUrl)
  if (json.data.status.name === `OK`) {
    const user = json.data.them[0]
    if (user && user.pictures && user.pictures.primary) {
      return {
        keybaseId,
        avatarUrl: user.pictures.primary.url,
        userName: user.basics.username,
        profileUrl: `https://keybase.io/` + user.basics.username
      }
    }
  }
}

async function lookupUsername(state, keybaseId, username) {
  const urlPrefix = `https://keybase.io/_/api/1.0/user/lookup.json?usernames=`
  const fullUrl = urlPrefix + username
  const json = await state.externals.axios(fullUrl)
  if (json.data.status.name === `OK`) {
    const user = json.data.them[0]
    if (user && user.pictures && user.pictures.primary) {
      return {
        keybaseId,
        avatarUrl: user.pictures.primary.url,
        userName: user.basics.username,
        profileUrl: `https://keybase.io/` + user.basics.username
      }
    }
  }
}