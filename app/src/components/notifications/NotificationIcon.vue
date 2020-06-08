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
  name: "NotificationIcon",
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
        /* istanbul ignore next */
        variables() {
          return {
            addressObjects: this.session.allSessionAddresses,
          }
        },
        /* istanbul ignore next */
        skip() {
          return (
            !this.session.allSessionAddresses ||
            this.session.allSessionAddresses.length === 0
          )
        },
        /* istanbul ignore next */
        result({ data }) {
          if (data.notificationAdded) {
            this.updateNotificationsAvailable()
          }
        },
      },
    },
  },
}
</script>

<style scoped>
.notification-bell {
  width: 1rem;
}
</style>
