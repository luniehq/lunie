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
    axios
  }

  const mutations = {
    setKeybaseIdentities(state, identities) {
      identities.forEach(identity => {
        state.identities[identity.keybaseId] = identity || {}
        state.identities[identity.keybaseId].lastUpdated =
          new Date().toUTCString()
      })
    }
  }

  const actions = {
    async getKeybaseIdentity({ state }, keybaseId) {
      if (!/.{16}/.test(keybaseId)) return // the keybase id is not correct
      if (state.identities[keybaseId]) { // we already have this identity
        // check if the last check is more then 2 days ago
        if (moment.duration(moment(state.identities[keybaseId].lastUpdated).diff(moment(), `days`)) >= 2) {
          return state.identities[keybaseId]
        }

        return lookupUsername(state, state.identities[keybaseId].userName)
        // https://keybase.io/_/api/1.0/user/lookup.json?usernames=chris,max
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
        avatarUrl: user.pictures.primary.url,
        userName: user.basics.username,
        profileUrl: `https://keybase.io/` + user.basics.username
      }
    }
  }
}

async function lookupUsername(state, username) {
  const urlPrefix = `https://keybase.io/_/api/1.0/user/lookup.json?usernames=`
  const fullUrl = urlPrefix + username
  const json = await state.externals.axios(fullUrl)
  if (json.data.status.name === `OK`) {
    const user = json.data.them[0]
    if (user && user.pictures && user.pictures.primary) {
      return {
        avatarUrl: user.pictures.primary.url,
        userName: user.basics.username,
        profileUrl: `https://keybase.io/` + user.basics.username
      }
    }
  }
}