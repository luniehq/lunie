<template>
    <img
        v-if="session.notificationAvailable"
        class="notification-bell"
        src="/img/icons/notifications/bell-icon-alert.png"
        alt="bell icon alert"
    />
    <img
        v-else
        class="notification-bell"
        src="/img/icons/notifications/bell-icon.png"
        alt="bell icon"
    />
</template>

<script>
import { mapState } from "vuex"
import { NotificationAdded } from "src/gql"

export default {
  name: "notification-icon", 
  computed: {
    ...mapState([`session`]),
  },
  methods: {
    updateNotificationsAvailable() {
      this.$store.dispatch(`setNotificationAvailable`, {
        notificationAvailable: true,
      })
    },
  },
  apollo: {
    $subscribe: {
      notificationAdded: {
        query: NotificationAdded,
        variables() {
          /* istanbul ignore next */
          return {
            addressObjects: this.session.allSessionAddresses,
          }
        },
        skip() {
          /* istanbul ignore next */
          return (
            !this.session.allSessionAddresses || this.session.allSessionAddresses.length === 0
          )
        },
        result({ data }) {
          /* istanbul ignore next */
          if (data.notificationAdded) {
            this.updateNotificationsAvailable()
          }
        },
      },
    },
  },
}
</script>

<style>
.notification-bell {
  width: 1rem;
}
</style>