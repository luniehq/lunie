<template>
  <TmPage data-title="My alerts" hide-header>
    <div class="header">
      <h1>Notifications</h1>
      <div class="icon">
        <i>🔔</i>
      </div>
    </div>

    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification"
    >
      <div class="content">
        <img :src="notification.icon" />
        <div>
          <h3 class="title">{{ notification.title }}</h3>
        </div>
      </div>
      <i class="material-icons notranslate">chevron_right</i>
    </div>
  </TmPage>
</template>

<script>
import TmPage from "../common/TmPage"
import { mapGetters } from "vuex"
import gql from "graphql-tag"

export default {
  name: "PageNotifications",
  components: {
    TmPage
  },
  data: () => ({
    notifications: [],
    notificationsMock: [
      {
        id: 1,
        title: "Hello World",
        date: new Date(),
        body:
          "hello world hello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello world",
        link: "www.google.de",
        icon: "https://lunie.fra1.digitaloceanspaces.com/android-icon-72x72.png"
      },
      {
        id: 2,
        title: "Lunie promo",
        date: new Date(),
        body: "Lunie rocks. Join the family",
        link: "www.google.de",
        icon: "https://lunie.fra1.digitaloceanspaces.com/android-icon-72x72.png"
      },
      {
        id: 3,
        title: "Lunie becomes the first PoS wallet with more than 12 networks",
        date: new Date(),
        body: "As their CEO announced on Monday, this wallet is on fire",
        link: "www.google.de",
        icon: "https://lunie.fra1.digitaloceanspaces.com/android-icon-72x72.png"
      }
    ]
  }),
  computed: {
    ...mapGetters([`networks`]),
    networkIds() {
      return this.networks.map(network => network.id)
    },
    allSessionAddresses() {
      let allSessionAddresses = []
      this.networkIds.forEach(networkId => {
        allSessionAddresses.push({
          networkId,
          address: JSON.parse(localStorage.getItem(`session_${networkId}`))
            .address
        })
      })
      return allSessionAddresses
    }
  },
  apollo: {
    notifications: {
      query: gql`
        query notifications($addresses: [NotificationInput]!) {
          notifications(addresses: $addresses) {
            created_at
            data
            eventType
            id
            networkId
            resourceId
            resourceType
            topic
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          address: this.allSessionAddresses
        }
      },
      /* istanbul ignore next */
      skip() {
        return (
          !this.allSessionAddresses || this.allSessionAddresses.length === 0
        )
      }
    }
  }
}
</script>

<style scoped>
.tm-page {
  padding: 0 2rem;
}
.header {
  display: flex;
  font-size: 1.5rem;
  text-align: center;
}
.header h1 {
  flex: 1;
}
.icon {
  margin: 0 1rem 1rem;
}
.notification {
  background-color: white;
  margin: 0.5rem 0 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  color: darkgray;
  align-items: center;
  padding: 1rem;
  justify-content: space-between;
  cursor: pointer;
}
img {
  width: 2rem;
  height: 2rem;
  margin-right: 1rem;
}
.content {
  flex-direction: row;
  display: flex;
  align-items: center;
}
.title {
  color: var(--notification-title);
  font-weight: 400;
}
</style>
