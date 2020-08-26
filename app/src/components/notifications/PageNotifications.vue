<template>
  <div class="notifications-container">
    <div class="notifications-header">
      <h2>Notifications</h2>
      <a class="intercom-button" @click="handleIntercom()"
        >Questions or feedback?</a
      >
    </div>
    <TmPage
      data-title="My alerts"
      :loading="$apollo.queries.notifications.loading && !firstLoaded"
      :loading-more="
        $apollo.queries.notifications.loading && !dataLoaded && moreAvailable
      "
      :empty="notifications.length === 0"
      :empty-title="`You don't have any notifications yet`"
      :empty-subtitle="`To start receiving notifications, all you have to do is use an address on any Lunie supported network. We'll take care of the rest!`"
    >
      <template>
        <EventList
          :events="notifications"
          :more-available="moreAvailable"
          @loadMore="loadMore"
        >
          <template slot-scope="event">
            <router-link
              :key="event.id"
              class="notification"
              :to="event.link.includes('transactions') ? '' : event.link"
              :class="{ disabled: event.link.includes('transactions') }"
            >
              <div class="content">
                <img :src="event.icon" />
                <div>
                  <h3 class="title">{{ event.title }}</h3>
                </div>
                <i
                  v-if="!event.link.includes('transactions')"
                  class="material-icons notranslate"
                  >chevron_right</i
                >
              </div>
            </router-link>
          </template>
        </EventList>
      </template>
    </TmPage>
  </div>
</template>

<script>
import TmPage from "common/TmPage"
import EventList from "common/EventList"
import { mapState, mapGetters } from "vuex"
import uniqBy from "lodash.uniqby"
import gql from "graphql-tag"

export default {
  name: "PageNotifications",
  components: {
    TmPage,
    EventList,
  },
  data: () => ({
    notifications: [],
    moreAvailable: true,
    dataLoaded: false,
    firstLoaded: false,
  }),
  computed: {
    ...mapState([`session`, `account`]),
    ...mapGetters([`networks`]),
    userSignedIn() {
      return this.account.userSignedIn
    },
  },
  watch: {
    userSignedIn: function () {
      if (!this.userSignedIn) {
        this.$router.push({
          name: `notification-wall`,
        })
      }
    },
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
            this.moreAvailable = !(fetchMoreResult.notifications.length === 0)
            return {
              // DEPRECATE uniqBy, should be resolved via API
              notifications: uniqBy(
                [
                  ...previousResult.notifications,
                  ...fetchMoreResult.notifications,
                ],
                "id"
              ),
            }
          },
        })
      }
    },
    handleIntercom() {
      this.$store.dispatch(`displayMessenger`)
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
            id
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
        this.firstLoaded = true
        // assume that when the full page got loaded, that there is more
        return result.notifications
      },
      /* istanbul ignore next */
      skip() {
        return (
          !this.session.allSessionAddresses ||
          this.session.allSessionAddresses.length === 0
        )
      },
      result(data) {
        /* istanbul ignore next */
        this.error = data.error
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
.notifications-container {
  padding: 0 2rem 2rem;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h2 {
  font-size: 36px;
  font-weight: 400;
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

.end {
  color: var(--txt);
  text-align: center;
  padding: 4rem 0 2rem;
}

.disabled {
  cursor: unset;
}

@media screen and (max-width: 667px) {
  .notifications-container {
    padding: 0 1rem;
  }

  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
