<template>
  <div v-infinite-scroll="loadMore" infinite-scroll-distance="80">
    <template v-for="group in groupedEvents">
      <div :key="group[0].section">
        <h3>{{ group[0].section }}</h3>
        <template v-for="item in group">
          <slot v-bind="item.event" />
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import groupBy from "lodash.groupby"
import orderBy from "lodash.orderby"
import moment from "moment"

const categories = [
  {
    section: "Today",
    matcher: (event) => {
      // tests if the timestamp has the same day as today
      return moment(event.timestamp).isSame(moment(), "day")
    },
  },
  {
    section: "Yesterday",
    matcher: (event) => {
      return moment(event.timestamp).isSame(moment().subtract(1, "days"), "day")
    },
  },
]

export default {
  name: `event-list`,
  props: {
    events: {
      type: Array,
      required: true,
    },
    moreAvailable: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    showing: 15,
    maxReached: false,
  }),
  computed: {
    showingEvents() {
      return this.events.slice(0, this.showing)
    },
    groupedEvents() {
      return orderBy(
        groupBy(this.categorizedEvents, "section"),
        (group) => group[0].event.timestamp,
        "desc"
      )
    },
    categorizedEvents() {
      return this.showingEvents.map((event) => {
        // check if the tx is in Today, Yesterday or Last Week
        const dateString =
          ` (` + moment(event.timestamp).format("MMMM Do") + `)`
        const category = categories.find(({ matcher }) => matcher(event))
        if (category) {
          return {
            section: category.section + dateString,
            event,
          }
        }

        // check if tx is in a month this year
        const date = moment(event.timestamp)
        const today = moment()
        if (date.year() === today.year()) {
          return {
            section: date.format("MMMM Do"),
            event,
          }
        }

        // tx is in a month another year
        return {
          section: date.format("MMMM Do, YYYY"),
          event,
        }
      })
    },
  },
  methods: {
    loadMore() {
      if (!this.maxReached) {
        this.showing += 50

        if (this.showing > this.events.length - 100 && !this.moreAvailable) {
          this.maxReached = true
        }

        // preload next transactions before scroll end and check if last loading loads new records
        if (this.showing > this.events.length - 100 && this.moreAvailable) {
          this.$emit("loadMore")
        }
      }
    },
  },
}
</script>
<style scoped>
h3 {
  margin: 2rem 0 0.5rem 1.5rem;
  color: var(--dim);
  font-size: var(--sm);
  font-weight: 500;
}
</style>
