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
  state.identities = JSON.parse(localStorage.getItem(`keybaseCache`) || `{}`)

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
        // check if the last check is more then 1 days ago or 2 minutes if loading failed
        if (
          (!state.identities[keybaseId].userName && state.externals.moment(state.identities[keybaseId].lastUpdated).diff(state.externals.moment(), `minutes`) <= -2) ||
          (state.externals.moment(state.identities[keybaseId].lastUpdated).diff(state.externals.moment(), `days`) <= -1)
        ) {
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

async function lookupId(state, keybaseId) {
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
          profileUrl: `https://keybase.io/` + user.basics.username
        }
      }
    }
  } catch (error) {
    return {
      keybaseId
    }
  }
}