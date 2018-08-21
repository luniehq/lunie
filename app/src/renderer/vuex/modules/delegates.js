import axios from "axios"

export default ({ node }) => {
  const emptyState = {
    delegates: [],
    loading: false
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setDelegateLoading(state, loading) {
      state.loading = loading
    },
    setDelegates(state, delegates) {
      state.delegates = delegates
    },
    addDelegate(state, delegate) {
      delegate.id = delegate.owner

      // TODO: calculate voting power
      delegate.voting_power = delegate.tokens

      // update if we already have this delegate
      for (let existingDelegate of state.delegates) {
        if (existingDelegate.id === delegate.id) {
          Object.assign(existingDelegate, delegate)
          return
        }
      }

      state.delegates.push(delegate)
    },
    setKeybaseIdentity(
      state,
      { validatorOwner, avatarUrl, profileUrl, userName }
    ) {
      let validator = state.delegates.find(v => v.owner === validatorOwner)
      validator.avatarUrl = avatarUrl
      validator.keybaseUrl = profileUrl
      validator.keybaseUserName = userName
    }
  }

  const actions = {
    reconnected({ state, dispatch }) {
      if (state.loading) {
        dispatch("getDelegates")
      }
    },
    resetSessionData({ rootState }) {
      rootState.delegates = JSON.parse(JSON.stringify(emptyState))
    },
    async getDelegates({ state, commit, dispatch }) {
      commit("setDelegateLoading", true)
      let candidates = await node.getCandidates()
      let { validators } = await node.getValidatorSet()
      for (let delegate of candidates) {
        if (validators.find(v => v.pub_key === delegate.pub_key)) {
          delegate.isValidator = true
        }
        commit("addDelegate", delegate)
      }

      commit("setDelegates", candidates)
      commit("setDelegateLoading", false)
      dispatch("updateValidatorAvatars")

      return state.delegates
    },
    async updateValidatorAvatars({ state, commit }) {
      state.delegates.map(async validator => {
        if (validator.description.identity) {
          let urlPrefix =
            "https://keybase.io/_/api/1.0/user/lookup.json?key_suffix="
          let fullUrl = urlPrefix + validator.description.identity
          let json = await axios.get(fullUrl)
          if (json.data.status.name === "OK") {
            let user = json.data.them[0]
            if (user.pictures && user.pictures.primary) {
              commit("setKeybaseIdentity", {
                validatorOwner: validator.owner,
                avatarUrl: user.pictures.primary.url,
                userName: user.basics.username,
                profileUrl: "https://keybase.io/" + user.basics.username
              })
            }
          }
        }
      })
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
