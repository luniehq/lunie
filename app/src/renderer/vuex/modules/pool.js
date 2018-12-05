import Raven from "raven-js"

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
        let pool = await node.getPool()
        commit(`setPool`, pool)
        state.error = null
        state.loading = false
        state.loaded = true
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching staking pool information`,
          body: error.message
        })
        Raven.captureException(error)
        state.error = error
      }
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
