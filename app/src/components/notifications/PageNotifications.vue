<template>
  <TmPage data-title="My alerts" hide-header>
    <TmDataLoading v-if="$apollo.loading && notifications.length === 0" />
    <TmDataMsg
      v-else-if="!$apollo.loading && notifications.length === 0"
      icon="error"
      icon-color="var(--dark-grey-blue)"
    >
      <div>
        <i class="material-icons nontranslate">error</i>
      </div>
      <div slot="title">You don't have any notifications yet</div>
      <div slot="subtitle">Don't worry, they are on their way!</div>
    </TmDataMsg>

    <div v-else>
      <EventList
        :events="notifications"
        :more-available="moreAvailable"
        @loadMore="loadMore"
      >
        <template slot-scope="event">
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
      <div
        v-if="$apollo.loading && !dataLoaded && moreAvailable"
        class="spinner-container"
      >
        <img src="/img/spinner_blue@256.gif" class="spinner" />
      </div>
    </div>
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
import TmDataMsg from "common/TmDataMsg"
import EventList from "common/EventList"
import TmDataLoading from "common/TmDataLoading"
import { mapState, mapGetters } from "vuex"
import gql from "graphql-tag"

export default {
  name: "PageNotifications",
  components: {
    TmPage,
    TmDataMsg,
    EventList,
    TmDataLoading,
  },
  data: () => ({
    notifications: [],
    moreAvailable: true,
    dataLoaded: false,
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`networks`]),
  },
  mounted: async function () {
    // set notificationAvailable to false
    this.$store.dispatch(`setNotificationAvailable`, {
      notificationAvailable: false,
    })
  },
  methods: {
    loadMore() {
      // to prevent multiple requests
      if (this.dataLoaded === true) {
        // loads new portion
        this.dataLoaded = false
        const lastTimestamp = this.notifications[this.notifications.length - 1]
          .timestamp
        const dateLastTimestamp = new Date(lastTimestamp)
        this.$apollo.queries.notifications.fetchMore({
          // New variables
          variables: {
            // get notifications that are older then the last one
            timestamp: dateLastTimestamp.toISOString(),
            addressObjects: this.session.allSessionAddresses.map(
              ({ networkId, address }) => ({ networkId, address })
            ),
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
        query notifications(
          $timestamp: String
          $addressObjects: [NotificationInput]!
        ) {
          notifications(
            timestamp: $timestamp
            addressObjects: $addressObjects
          ) {
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
          timestamp: "",
          addressObjects: this.session.allSessionAddresses.map(
            ({ networkId, address }) => ({ networkId, address })
          ),
        }
      },
      /* istanbul ignore next */
      update(result) {
        this.dataLoaded = true
        // assume that when the full page got loaded, that there is more
        this.moreAvailable = result.notifications.length % 20 === 0
        return result.notifications
      },
      /* istanbul ignore next */
      skip() {
        return (
          !this.session.allSessionAddresses ||
          this.session.allSessionAddresses.length === 0
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
            addressObjects: this.session.allSessionAddresses.map(
              ({ networkId, address }) => ({ networkId, address })
            ),
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
  border-radius: 50%;
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

.spinner-container {
  display: flex;
  justify-content: center;
}

.spinner {
  height: 45px;
  width: 45px;
}
</style>
