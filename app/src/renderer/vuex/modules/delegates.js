import { decode, encode } from "scripts/b32"
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
      let divIdx = delegate.tokens.indexOf("/")
      let tokens
      if (divIdx == -1) {
        tokens = Number(delegate.tokens)
      } else {
        tokens =
          Number(delegate.tokens.substring(0, divIdx)) /
          Number(delegate.tokens.substring(divIdx + 1))
      }
      delegate.voting_power = tokens.toFixed(2)

      // update if we already have this delegate
      for (let existingDelegate of state.delegates) {
        if (existingDelegate.id === delegate.id) {
          Object.assign(existingDelegate, delegate)
          return
        }
      }

      state.delegates.push(delegate)
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
    async getDelegate({ rootState, commit }, validatorAddress) {
      console.log(validatorAddress)

      // let address = decode(validatorAddress)
      // console.log("address", address)
      //
      // let encoded = encode(address, "cosmosval")
      // console.log("cosmosval", encoded)
      //
      // let encoded2 = encode(address, "cosmosvaladdr")
      // console.log("cosmosvaladdr", encoded2)

      let delegate = await node.getCandidate(validatorAddress)
      console.log(delegate)

      commit("addDelegate", encoded)
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
      dispatch("getKeybaseIdentities", candidates)

      return state.delegates
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
