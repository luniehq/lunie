<template lang='pug'>
.chart-votes(:class="cssClass")
  .chart-canvas: canvas(:id="id")
  .chart-legend(v-if="size === 'lg'" :class="chartLabelClass")
    .kv.abstain: .container
      .key Abstain
      .value {{ votes.abstain }}
    .kv.yes: .container
      .key Yes
      .value {{ votes.yes }}
    .kv.reject: .container
      .key Reject
      .value {{ votes.reject }}
    .kv.no: .container
      .key No
      .value {{ votes.no }}
  .chart-label(v-else :class="chartLabelClass") {{ chartLabel }}
</template>

<script>
import Chart from 'chart.js'
import shortid from 'shortid'
export default {
  name: 'chart-votes',
  props: ['votes', 'size'],
  computed: {
    cssClass () {
      if (this.size === 'lg') {
        return 'chart-votes-size-lg'
      } else {
        return 'chart-votes-size-sm'
      }
    },
    chartLabel () {
      let data = this.chartData.datasets[0].data
      return Math.max.apply(Math, data)
    },
    chartLabelClass () {
      let data = this.chartData.datasets[0].data
      let index = data.indexOf(Math.max.apply(Math, data))
      switch (index) {
        case 0: return 'yes'
        case 1: return 'no'
        default: return 'reject'
      }
    },
    chartData () {
      return {
        labels: [
          'Yes',
          'No',
          'Reject',
          'Abstain'
        ],
        datasets: [
          {
            borderWidth: 0,
            data: this.chartValues,
            backgroundColor: [
              'hsl(120,100%,50%)',
              'hsl(30,100%,50%)',
              'hsl(0,100%,50%)',
              'hsl(0,0%,50%)'
            ]
          }
        ]
      }
    },
    chartValues () {
      let values = []
      for (let v in this.votes) {
        values.push(this.votes[v])
      }
      return values
    }
  },
  data: () => ({
    id: 'chart-votes-' + shortid.generate(),
    chartOptions: {
      animation: {
        duration: 0
      },
      cutoutPercentage: 92,
      legend: {
        display: false
      },
      responsive: true,
      maintainAspectRatio: false
    }
  }),
  mounted () {
    let ctx = document.querySelector('#' + this.id)
    // eslint-disable-next-line
    new Chart(ctx, {
      type: 'doughnut',
      data: this.chartData,
      options: this.chartOptions
    })
  }
}
</script>

<style lang='stylus'>
@require '~variables'

.chart-votes
  position relative
  .chart-canvas
    position relative
    display flex
    align-items center
    justify-content center

  &.chart-votes-size-sm

    .chart-canvas
      width 4rem
      height 4rem
      // border-radius 2rem

    .chart-label
      position absolute
      top 0
      left 0

      width 4rem
      height 4rem

      display flex
      align-items center
      justify-content center
      font-size xl
      font-weight 300

      &.yes
        color success
      &.no
        color warning
      &.reject
        color danger


  &.chart-votes-size-lg

    .chart-canvas
      width 18rem
      height 18rem
      border-radius 9rem

    .legend
      width 8rem
      height 10rem
      position absolute
      top 4rem
      left 5rem
      display flex
      flex-flow row wrap
      border-radius 6rem
      .kv
        flex 0 0 50%
        display flex
        padding 0 0.5rem

        &.yes .value
          color success
        &.no .value
          color warning
        &.reject .value
          color danger

        .container
          flex 1
          display flex
          flex-flow column nowrap
          align-items center
          justify-content center
          border-top 4px solid bc

        .key
          border-bottom 1px dotted bc
          height 2rem - 4*px
          width 100%

          display flex
          align-items center
          justify-content center

          font-size 0.6666em
          color dim
          text-transform uppercase

        .value
          flex 1
          color bright
          font-size 1.5rem

          display flex
          align-items center
          justify-content center
</style>
