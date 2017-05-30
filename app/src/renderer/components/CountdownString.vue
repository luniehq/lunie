<template>
  <div class="ni-countdown-string">
    <div class="ni-cd-block">
      {{ twoDigits(days) }}
      <span class="key">D</span>
    </div>
    <div class="ni-cd-block">
      {{ twoDigits(hours) }}
      <span class="key">H</span>
    </div>
    <div class="ni-cd-block">
      {{ twoDigits(minutes) }}
      <span class="key">M</span>
    </div>
    <div class="ni-cd-block">
      {{ twoDigits(seconds) }}
      <span class="key">S</span>
    </div>
  </div>
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
@require '../styles/variables.styl'

.ni-countdown-string
  display inline-block
  padding 0 1rem
  height 2rem
  display flex
  align-items center

  .ni-cd-block
    display flex
    margin-right 0.5rem
    &:last-child
      margin-right 0
    span
      color light
</style>
