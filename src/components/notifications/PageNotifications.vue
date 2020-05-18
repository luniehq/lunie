<template>
  <TmPage data-title="My alerts" hide-header>
    <div class="header">
      <h1>Notifications</h1>
    </div>

    <TmDataMsg
      v-if="notifications.length === 0"
      icon="error"
      icon-color="var(--dark-grey-blue)"
    >
      <div>
        <i class="material-icons nontranslate">error</i>
      </div>
      <div slot="title">You don't have any notifications yet</div>
      <div slot="subtitle">Don't worry, they are on their way!</div>
    </TmDataMsg>

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
import TmDataMsg from "common/TmDataMsg"
import { mapGetters } from "vuex"
import gql from "graphql-tag"

export default {
  name: "PageNotifications",
  components: {
    TmPage,
    TmDataMsg
  },
  data: () => ({
    notifications: [],
    dbNotificationsAddressObjects: [
      {
        networkId: "cosmos-hub-testnet",
        address: "cosmos1de7pk372jkp9vrul0gv5j6r3l9mt3wa6m4h6h0"
      },
      {
        networkId: "kava-testnet",
        address: "kava1keh9ywk0h47l9zz9z7tjk0v4c94hxpkn4620vx"
      },
      {
        networkId: "kusama",
        address: "HRPW2yeG84Z7uGouPyCvDFR2W61CCe9dkABhrToxgjPQ97i"
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
        query notifications($addressObjects: [NotificationInput]!) {
          notifications(addressObjects: $addressObjects) {
            networkId
            timestamp
            title
            link
            icon
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          addressObjects: this.dbNotificationsAddressObjects
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.notifications
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
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
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
  flex-shrink: 0;
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
  overflow-wrap: anywhere; /** Important. Otherwise awful style bug */
}
</style>
