import gql from "graphql-tag"
import { updatePushNotificationRegistration } from "scripts/pushNotifications"

export default ({ apollo }) => {
  const state = {}

  const mutations = {}

  const actions = {
    updateNotificationRegistrations({ dispatch }) {
      dispatch("updateEmailRegistrations")
      dispatch("updatePushRegistrations")
    },
    async updateEmailRegistrations({ rootState }) {
      // if the user is not signed in, we can't register topics for email notifications on the server
      if (!rootState.account.userSignedIn) return

      const addressObjects = rootState.session.allSessionAddresses.map(
        ({ networkId, address }) => ({ networkId, address })
      )
      apollo.mutate({
        mutation: gql`
          mutation($addressObjects: [NotificationInput]!) {
            notifications(
              addressObjects: $addressObjects
              notificationType: "email"
            )
          }
        `,
        variables: {
          addressObjects,
        },
      })
    },
    async updatePushRegistrations({ rootState }) {
      // if the user is not signed in, we can't register topics for email notifications on the server
      if (!rootState.account.userSignedIn) return

      const addressObjects = rootState.session.allSessionAddresses.map(
        ({ networkId, address }) => ({ networkId, address })
      )
      return updatePushNotificationRegistration(addressObjects, apollo)
    },
  }

  return { state, mutations, actions }
}
