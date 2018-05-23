<template lang="pug">
.ni-event__container: .ni-event
  .ni-event__image-container
    a.ni-event__image(:href="event.href" target="_blank")
      img.ni-event__location(
        v-if="event.images.location"
        :src="image('events/locations', event.images.location, 'jpg')")
      .ni-event__logo-bg: .ni-event__background
      img.ni-event__logo(
        v-if="event.images.logo"
        :src="image('events/logos', event.images.logo, 'png')")
  .ni-event__content
    .ni-event__header
      a.ni-event__title(:href="event.href" target="_blank") {{ event.title }}
      .ni-event__subtitle
        .ni-event__date
          i.material-icons date_range
          | {{ dateStart }}
          template(v-if="event.dates.end")  - {{ dateEnd }}
        .ni-event__location
          i.material-icons room
          | {{ location }}
    .ni-event__body {{ event.body }}
    .ni-event__footer
      btn(
        type="anchor"
        color="primary"
        :href="event.href"
        target="_blank"
        value="Learn more")
      btn(
        v-if="status === 'ended'"
        disabled
        value="Event ended")
      btn(
        v-else-if="dateStart !== 'TBD'"
        type="anchor"
        :href="addToCalendarGoogle"
        target="_blank"
        value="Add to calendar")
</template>

<script>
import moment from "moment"
import { image } from "scripts/cdn"
import Btn from "@nylira/vue-button"
export default {
  name: "ni-event-container",
  components: {
    Btn
  },
  computed: {
    location() {
      if (this.event.location) {
        return this.event.location
      } else {
        return "TBD"
      }
    },
    dateStart() {
      let dateStart = this.event.dates.start
      if (dateStart) {
        if (this.status === "ended") {
          return moment(dateStart).format("YYYY MMMM D")
        } else {
          return moment(dateStart).format("MMMM D")
        }
      } else {
        return "TBD"
      }
    },
    dateEnd() {
      let dateEnd = this.event.dates.end
      if (dateEnd) {
        return moment(dateEnd).format("D")
      }
    },
    addToCalendarGoogle() {
      let eventTitle = this.event.title
      let eventLoc = this.event.title
      let eventDesc = `For event details, visit: ${
        this.event.href
      }. This is an event sponsored by Tendermint (https://tendermint.com) and Cosmos (https://cosmos.network)`
      let dateFormat = "YMMDDTHHmmss"
      let eventStart = moment(this.event.dates.start).format(dateFormat) + "Z"
      let eventEnd = moment(this.event.dates.end).format(dateFormat) + "Z"
      let eventDates = ""
      if (eventEnd) {
        eventDates = eventStart + "/" + eventEnd
      } else {
        eventDates = eventStart
      }
      return `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${eventDates}&details=${eventDesc}&location=${eventLoc}&sf=true&output=xml`
    }
  },
  data: () => ({ image: image }),
  props: ["event", "status"]
}
</script>

<style lang="stylus">
@require '~variables'

.ni-event__container
  border-top 1px solid bc

.ni-event__image-container
  padding 1rem 1rem 0

.ni-event__image
  position relative
  display block
  img
    display block
    max-width 100%
    height auto
  i.material-icons
    display block
    font-size 3rem
    height 10rem
    color bc
    background app-fg
    display flex
    align-items center
    justify-content center

.ni-event__logo-bg
  position absolute
  top 0
  left 0
  bottom 0
  right 0

.ni-event__background
  position relative
  top 12.5%
  width 100%
  height 75%
  background hsla(233,33%,16%,0.5)
  background linear-gradient(hsla(233,33%,16%,0.01), hsla(233,33%,16%,0.75), hsla(233,33%,16%,0.01))

.ni-event__logo
  position absolute
  top 0
  left 0
  display block

.ni-event__content
  padding 1rem
  display flex
  flex-flow column

.ni-event__header
.ni-event__body
  margin 0 0 0.5rem

.ni-event__title
  font-size h3
  line-height 1
  padding 0.375rem 0
  font-weight 500

.ni-event__subtitle
  display flex

.ni-event__date
.ni-event__location
  font-size sm
  display flex
  align-items center
  i
    color dim
    margin-right 0.25rem

.ni-event__date
  margin-right 0.75rem

.ni-event__body
  flex 1

.ni-event__footer
  .ni-btn
    margin-right 0.5rem
    &:last-child
      margin-right 0

@media screen and (min-width: 768px)
  .ni-event
    display flex

  .ni-event__image-container
  .ni-event__content
    padding-top 1.5rem
    padding-bottom 1.5rem

  .ni-event__image-container
    padding-left 1rem
    padding-right 0.5rem
    flex 0 0 16rem + 1.5rem

  .ni-event__header
  .ni-event__body
    margin-bottom 1rem

  .ni-event__date
  .ni-event__location
    font-size x

@media screen and (min-width: 1024px)
  .ni-event__image-container
  .ni-event__content
    padding-top 2rem
    padding-bottom 2rem

  .ni-event__image-container
    flex 0 0 20rem + 1.5rem
</style>
