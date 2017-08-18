<template lang='pug'>
  .chart-votes(:class="cssClass")
    canvas(:id="id")
    .legend(v-if="size === 'lg'" :class="chartLabelClass")
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
    .label(v-else :class="chartLabelClass") {{ chartLabel }}
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
              'hsl(210,41%,49%)',
              'hsl(60,18%,70%)',
              'hsl(345,75%,49%)',
              'hsl(210,32%,12%)'
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
      cutoutPercentage: 85,
      legend: {
        display: false
      }
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
@require '~@/styles/variables.styl'

.chart-votes
  position relative
  display flex
  align-items center
  justify-content center
  border 1*px solid bc

  &.chart-votes-size-sm
    width 4rem
    height 4rem
    border-radius 5rem

    .label
      position absolute
      top 0.75rem - 1*px
      left 0.75em - 1*px

      width 2.5rem
      height 2.5rem
      border 1px dotted bc-dim
      border-radius 2rem

      display flex
      align-items center
      justify-content center
      line-height 1

      &.yes
        color bc-vivid
      &.no
        color accent1
      &.reject
        color accent2

  &.chart-votes-size-lg
    width 18rem
    height 18rem
    border-radius 20rem

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
           color bc-vivid
        &.no .value
          color accent1
        &.reject .value
          color accent2

        .container
          flex 1
          display flex
          flex-flow column nowrap
          align-items center
          justify-content center
          border-top 4px solid bc-dim

        .key
          border-bottom 1px dotted bc-dim
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
