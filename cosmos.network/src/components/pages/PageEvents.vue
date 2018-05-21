<template lang="pug">
page(title="Events")
  div(slot="menu")
    btn(icon="event" value="Contact Cosmos Events" type="anchor" :href="config.CONTACT_EVENTS_URL" target="_blank" color="primary")
  .card-event
    part(title="Upcoming Events" v-if="upcomingEvents.length > 0"): .ni-events
    card-event(v-for="e in upcomingEvents" :event="e" :key="e.id")
  part(title="Past Events" v-if="pastEvents.length > 0"): .ni-events
    card-event(v-for="e in pastEvents" :event="e" :key="e.id" status="ended")
</template>

<script>
import moment from "moment"
import { orderBy } from "lodash"
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
import CardEvent from "cards/NiCardEvent"
import Part from "common/NiPart"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-events",
  metaInfo: { title: "Events" },
  components: {
    Btn,
    CardEvent,
    Page,
    Part,
    TextContainer
  },
  computed: {
    upcomingEvents() {
      let tbdEvents = this.events.filter(e => e.dates.start === undefined)
      let datedEvents = this.events.filter(e => e.dates.start !== undefined)
      // fuzz search to current and future events within three days of today
      let events = datedEvents.filter(
        e => moment(e.dates.start).add(3, "days") >= moment()
      )
      events = orderBy(
        events,
        [
          function(e) {
            return moment(e.dates.start)
          }
        ],
        "asc"
      )
      tbdEvents.map(e => events.push(e))
      return events
    },
    pastEvents() {
      let events = this.events.filter(
        e => moment(e.dates.start).add(3, "days") < moment()
      )
      return orderBy(
        events,
        [
          function(e) {
            return moment(e.dates.start)
          }
        ],
        "desc"
      )
    },
    ...mapGetters(["events", "config"])
  }
}
</script>
