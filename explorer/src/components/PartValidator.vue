<template lang="pug">
part.part-validator(:title="'Validator - ' + validator.node_info.moniker")
  list-item(dt='Location'): div(slot="dd"): .map-img(:style='mapStyle')
  list-item(:dt="currentRate + ' byte/s'")
    div(slot="dd")
      .sparkline
        .bar(
          v-for='rate in currentRates'
          :key='rate.key'
          :style='{ height: rate.height }')
  list-item(dt="Avg Rate" :dd="averageRate + ' byte/s'")
  list-item(dt="Timezone" :dd="timezone")
</template>

<script>
import shortid from 'shortid'
import { maxBy } from 'lodash'
import num from '../scripts/num'
import Part from './NiPart'
import ListItem from './NiListItem'
export default {
  name: 'part-validator',
  components: {
    ListItem,
    Part
  },
  computed: {
    ip () {
      return this.validator.node_info.remote_addr.split(':')[0]
    },
    url () { return `http://${this.ip}:46657` },
    currentRate () {
      return this.validator.connection_status.SendMonitor.CurRate
    },
    averageRate () {
      return this.validator.connection_status.SendMonitor.AvgRate
    },
    mapStyle () {
      return {
        'background-size': 'cover',
        'background-image': 'url(' + this.mapSrc + ')',
        'background-repeat': 'no-repeat',
        'background-position': 'center center'
      }
    },
    mapSrc () {
      let zoom = 8
      let width = 192
      let height = 96
      let apiKey = this.apiKey
      let latitude = this.coordinates[0]
      let longitude = this.coordinates[1]
      return `https://maps.googleapis.com/maps/api/staticmap?key=${apiKey}&center=${latitude},${longitude}&zoom=${zoom}&format=png&maptype=roadmap&style=element:geometry%7Ccolor:0x1d2c4d&style=element:labels.text.fill%7Ccolor:0x8ec3b9&style=element:labels.text.stroke%7Ccolor:0x1a3646&style=feature:administrative.country%7Celement:geometry.stroke%7Ccolor:0x4b6878&style=feature:administrative.land_parcel%7Celement:labels.text.fill%7Ccolor:0x64779e&style=feature:administrative.province%7Celement:geometry.stroke%7Ccolor:0x4b6878&style=feature:landscape.man_made%7Celement:geometry.stroke%7Ccolor:0x334e87&style=feature:landscape.natural%7Celement:geometry%7Ccolor:0x023e58&style=feature:poi%7Celement:geometry%7Ccolor:0x283d6a&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0x6f9ba5&style=feature:poi%7Celement:labels.text.stroke%7Ccolor:0x1d2c4d&style=feature:poi.park%7Celement:geometry.fill%7Ccolor:0x023e58&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x3C7680&style=feature:road%7Celement:geometry%7Ccolor:0x304a7d&style=feature:road%7Celement:labels.text.fill%7Ccolor:0x98a5be&style=feature:road%7Celement:labels.text.stroke%7Ccolor:0x1d2c4d&style=feature:road.highway%7Celement:geometry%7Ccolor:0x2c6675&style=feature:road.highway%7Celement:geometry.stroke%7Ccolor:0x255763&style=feature:road.highway%7Celement:labels.text.fill%7Ccolor:0xb0d5ce&style=feature:road.highway%7Celement:labels.text.stroke%7Ccolor:0x023e58&style=feature:transit%7Celement:labels.text.fill%7Ccolor:0x98a5be&style=feature:transit%7Celement:labels.text.stroke%7Ccolor:0x1d2c4d&style=feature:transit.line%7Celement:geometry.fill%7Ccolor:0x283d6a&style=feature:transit.station%7Celement:geometry%7Ccolor:0x3a4762&style=feature:water%7Celement:geometry%7Ccolor:0x0e1626&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x4e6d70&size=${width}x${height}&scale=2`
    }
  },
  data: () => ({
    id: shortid.generate(),
    num: num,
    city: 'Loading...',
    timezone: 'Loading...',
    currentRates: [],
    coordinates: [],
    apiKey: 'AIzaSyDSc5AkfkFE4unWjKci1g6YcsQWviF9sHE'
  }),
  methods: {
    updateCurrentRates (value) {
      this.currentRates.push({
        key: new Date().getTime(),
        value: value,
        height: '0%'
      })

      // keep the length of the chart at x blocks
      if (this.currentRates.length > 60) this.currentRates.shift()

      let biggest = maxBy(this.currentRates, 'value').value
      this.currentRates.map(function (r) {
        // console.log('biggest', biggest)
        // console.log('r.value', r.value)
        // console.log('r.value / biggest', r.value / biggest)
        r.height = r.value / biggest * 100 + '%'
      })
    }
  },
  mounted () {
    let url = `https://freegeoip.net/json/${this.ip}`
    let self = this
    fetch(url)
      .then(res => res.json())
      .then((data) => {
        // console.log('Checkout this JSON! ', data)
        self.timezone = data.time_zone
        self.city = data.city
        self.coordinates = [data.latitude, data.longitude]
      })
    .catch(err => console.error(err))
  },
  props: ['validator'],
  watch: {
    'currentRate' (oldVal, newVal) {
      // console.log('delta current rate', oldVal, newVal)
      this.updateCurrentRates(newVal)
    }
  }
}
</script>

<style lang='stylus'>
@require '../styles/variables.styl'
.part-validator
  .map-img
    flex 1
    height 3rem - px

  .sparkline
    flex 1
    height 3rem - px
    display flex
    flex-flow row nowrap
    align-items flex-end
    justify-content flex-end
    background alpha(bc, 20%)
    .bar
      flex 0 0 1.666666666666666666%
      height 1rem
      background link
      border-right 1px solid #000
</style>

