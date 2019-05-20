import * as Sentry from "@sentry/browser"

export default ({ node }) => {
  const emptyState = {
    pool: {},
    loading: false,
    loaded: false,
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
    async getPool({ state, commit, rootState }) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        const pool = await node.get.pool()
        commit(`setPool`, pool)

        state.error = null
        state.loading = false
        state.loaded = true
      } catch (error) {
        Sentry.captureException(error)

        state.error = error
        state.loading = false
        state.loaded = false
      }
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
