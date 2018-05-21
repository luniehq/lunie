<template lang="pug">
.ni-event-sm__container
  a.ni-event-sm(:href="event.href" target="_blank")
    img.ni-event-sm__location(
      v-if="event.images.location"
      :src="image('events/locations', event.images.location, 'jpg')")
    .ni-event-sm__logo-bg: .ni-event-sm__background
    img.ni-event-sm__logo(
      v-if="event.images.logo"
      :src="image('events/logos', event.images.logo, 'png')")
    .ni-event-sm__meta
      .ni-event-sm__date
        i.material-icons date_range
        | {{ dateStart }}
        template(v-if="event.dates.end")  - {{ dateEnd }}
      .ni-event-sm__location
        i.material-icons room
        | {{ location }}
</template>

<script>
import moment from "moment"
import { image } from "scripts/cdn"
export default {
  name: "ni-event-sm-container",
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
    }
  },
  data: () => ({ image: image }),
  props: ["event", "status"]
}
</script>

<style lang="stylus">
@require '~variables'

.ni-event-sm__container
  padding 0.5rem
  border 1px solid bc

.ni-event-sm__container + .ni-event-sm__container
  border-top none

.ni-event-sm
  position relative
  display block
  img
    display block
    max-width 100%
    height auto

  &:hover
    .ni-event-sm__meta
      background alpha(link, 75%)
      i
        color lighten(link, 75%)

.ni-event-sm__logo-bg
  position absolute
  top 0
  left 0
  bottom 0
  right 0

.ni-event-sm__background
  position relative
  top 12.5%
  width 100%
  height 75%
  background hsla(233,33%,16%,0.5)
  background linear-gradient(hsla(233,33%,16%,0.01), hsla(233,33%,16%,0.75), hsla(233,33%,16%,0.01))

.ni-event-sm__logo
  position absolute
  top 0
  left 0
  display block

.ni-event-sm__meta
  width 100%
  position absolute
  bottom 0
  left 0
  background hsla(0,0,0,0.5)
  display flex
  height 2rem
  align-items center
  justify-content center

.ni-event-sm__date
.ni-event-sm__location
  font-size sm
  display flex
  align-items center
  color bright
  i
    color link
    margin-right 0.25rem

.ni-event-sm__date
  margin-right 0.75rem

@media screen and (min-width:768px)
  .ni-event-sm__container + .ni-event-sm__container
    border-top 1px solid bc
    border-left none
</style>
