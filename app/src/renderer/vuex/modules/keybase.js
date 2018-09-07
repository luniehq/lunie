import axios from "axios"

export default ({}) => {
  const emptyState = {
    identities: {},
    loading: false
  }
  const state = JSON.parse(JSON.stringify(emptyState))

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
      if (state.identities[keybaseId]) return // we already have this identity

      let urlPrefix =
        "https://keybase.io/_/api/1.0/user/lookup.json?key_suffix="
      let fullUrl = urlPrefix + keybaseId
      let json = await axios.get(fullUrl)
      if (json.data.status.name === "OK") {
        let user = json.data.them[0]
        if (user && user.pictures && user.pictures.primary) {
          return {
            keybaseId,
            avatarUrl: user.pictures.primary.url,
            userName: user.basics.username,
            profileUrl: "https://keybase.io/" + user.basics.username
          }
        }
      }
    },
    async getKeybaseIdentities({ dispatch, commit }, validators) {
      return Promise.all(
        validators.map(async validator => {
          if (validator.description.identity) {
            return dispatch(
              "getKeybaseIdentity",
              validator.description.identity
            )
          }
        })
      ).then(identities => {
        commit("setKeybaseIdentities", identities.filter(x => !!x))
      })
    }
  }

  return {
    state,
    actions,
    mutations
  }
}
