<template>
  <TmPage data-title="My alerts" hide-header>
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

    <EventList
      v-else
      :events="notifications"
      :more-available="moreAvailable"
      @loadMore="loadMore"
    >
      <template scope="event">
        <router-link :key="event.id" class="notification" :to="event.link">
          <div class="content">
            <img :src="event.icon" />
            <div>
              <h3 class="title">{{ event.title }}</h3>
            </div>
          </div>
          <i class="material-icons notranslate">chevron_right</i>
        </router-link>
      </template>
    </EventList>
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
import TmDataMsg from "common/TmDataMsg"
import EventList from "common/EventList"
import { mapGetters } from "vuex"
import gql from "graphql-tag"

export default {
  name: "PageNotifications",
  components: {
    TmPage,
    TmDataMsg,
    EventList,
  },
  data: () => ({
    notifications: [],
    allSessionAddresses: [],
    moreAvailable: true,
    dataLoaded: false,
  }),
  computed: {
    ...mapGetters([`networks`]),
  },
  mounted: async function () {
    const networkIds = this.networks.map((network) => network.id)
    this.allSessionAddresses = await this.$store.dispatch(
      `getAllSessionsAddresses`,
      { networkIds }
    )
  },
  methods: {
    loadMore() {
      // to prevent multiple requests
      if (this.dataLoaded === true) {
        // loads new portion
        this.dataLoaded = false
        this.$apollo.queries.notifications.fetchMore({
          // New variables
          variables: {
            addressObjects: this.allSessionAddresses,
            // get notifications that are older then the last one
            timestamp: this.notifications[this.notifications.length - 1]
              .timestamp,
          },
          // Transform the previous result with new data
          updateQuery: function (previousResult, { fetchMoreResult }) {
            return {
              notifications: [
                ...previousResult.notifications,
                ...fetchMoreResult.notifications,
              ],
            }
          },
        })
      }
    },
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
          addressObjects: this.allSessionAddresses,
        }
      },
      /* istanbul ignore next */
      update(result) {
        this.dataLoaded = true
        // assume that when the full page got loaded, that there is more
        this.moreAvailable = (result.notifications.length % 20 === 0)
        return result.notifications
      },
      /* istanbul ignore next */
      skip() {
        return (
          !this.allSessionAddresses || this.allSessionAddresses.length === 0
        )
      },
      subscribeToMore: {
        document: gql`
          subscription($addressObjects: [NotificationInput]!) {
            notificationAdded(addressObjects: $addressObjects) {
              networkId
              timestamp
              title
              link
              icon
            }
          }
        `,
        updateQuery: (previousResult, { subscriptionData }) => {
          if (previousResult && subscriptionData.data.notificationAdded) {
            return {
              notifications: [
                subscriptionData.data.notificationAdded,
                ...previousResult.notifications,
              ],
            }
          }
        },
        /* istanbul ignore next */
        variables() {
          return {
            addressObjects: this.allSessionAddresses,
          }
        },
      },
    },
  },
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
  background: var(--app-fg);
  margin: 0.5rem 0 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  color: var(--txt);
  align-items: center;
  padding: 1rem;
  justify-content: space-between;
  cursor: pointer;
}

.notification:hover {
  background: var(--app-fg-hover);
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
  font-weight: 400;
  overflow-wrap: anywhere; /** Important. Otherwise awful style bug */
}
</style>
