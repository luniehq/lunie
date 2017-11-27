<template lang="pug">
.ni-countdown-string
  .ni-cd-block {{ twoDigits(days) }} #[span.key D]
  .ni-cd-block {{ twoDigits(hours) }} #[span.key H]
  .ni-cd-block {{ twoDigits(minutes) }} #[span.key M]
  .ni-cd-block {{ twoDigits(seconds) }} #[span.key S]
</template>

<script>
export default {
  name: 'ni-countdown-string',
  computed: {
    usableDate () {
      return Math.trunc(Date.parse(this.date) / 1000)
    },
    seconds () {
      return (this.usableDate - this.now) % 60
    },
    minutes () {
      return Math.trunc((this.usableDate - this.now) / 60) % 60
    },
    hours () {
      return Math.trunc((this.usableDate - this.now) / 60 / 60) % 24
    },
    days () {
      return Math.trunc((this.usableDate - this.now) / 60 / 60 / 24)
    }
  },
  data () {
    return {
      now: Math.trunc((new Date()).getTime() / 1000)
    }
  },
  methods: {
    twoDigits (number) {
      if (number < 10) return '0' + number
      else return number
    }
  },
  mounted () {
    window.setInterval(() => {
      this.now = Math.trunc((new Date()).getTime() / 1000)
    }, 1000)
  },
  props: ['date', 'units']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-countdown-string
  display flex
  flex-flow row wrap
  margin 0 -0.25rem

  .ni-cd-block
    padding 0 0.25rem
    display flex
    color dim
    span
      color dim
      display block
</style>
