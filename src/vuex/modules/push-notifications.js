import config from "src/../config"

export default () => {
  const emptyState = {
    pushIdToken: undefined,
    pendingRegistration: undefined
  }
  const state = {
    ...emptyState
  }
  const mutations = {
    setPushIdToken(state, pushIdToken) {
      state.pushIdToken = pushIdToken
    },

    setPendingPushNotificationRegistration(state, addresses) {
      state.pendingRegistration = addresses
    }
  }

  const actions = {
    registerPushIdToken({ commit, dispatch }, pushIdToken) {
      commit("setPushIdToken", pushIdToken)

      if (state.pendingRegistration) {
        dispatch("registerPushNotifications", state.pendingRegistration)
        commit("setPendingPushNotificationRegistration", undefined)
      }
    },
    // register this device with out API so it will receive notifications
    async registerPushNotifications(
      { state: { pushIdToken }, commit },
      addresses
    ) {
      // if we have no push Id token yet, we wait until we have one
      if (!pushIdToken) {
        commit("setPendingPushNotificationRegistration", addresses)
        return
      }
      fetch(`${config.graphqlHost}/push/default`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pushId: pushIdToken,
          addresses // [{address, networkId}]
        })
      }).then(() =>
        console.log("Successfully registered for push notifications")
      )
    },
    // register this device with out API so it will receive notifications
    async unregisterPushNotifications({ state: { pushIdToken } }, addresses) {
      fetch(`${config.graphqlHost}/push/unregister`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pushId: pushIdToken,
          addresses // [{address, networkId}] // currently not used as the whole id token will be unregistered
        })
      }).then(() =>
        console.log("Successfully unregistered for push notifications")
      )
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
