"use strict"

export default ({ node }) => {
  const emptyState = {
    pool: {},
    loading: false,
    error: null
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  const mutations = {
    setPool(state, pool) {
      state.pool = pool
    }
  }

  const actions = {
    reconnected({ state, dispatch }) {
      if (state.loading) {
        dispatch(`getPool`)
      }
    },
    async getPool({ state, commit }) {
      state.loading = true
      try {
        let pool = await node.getPool()
        commit(`setPool`, pool)
      } catch (err) {
        console.error(err)
        state.error = err
      }
      state.loading = false
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
