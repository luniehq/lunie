<template lang='pug'>
.chart-votes(:class="cssClass")
  .chart-canvas: canvas
  .chart-legend(v-if="size === 'lg'" :class="chartLabelClass")
    .kv.abstain: .container
      .key Abstain
      .value {{ this.ratToNumber(votes.abstain) }}
    .kv.yes: .container
      .key Yes
      .value {{ this.ratToNumber(votes.yes) }}
    .kv.no: .container
      .key No
      .value {{ this.ratToNumber(votes.no) }}
    .kv.no_with_veto: .container
      .key No With Veto
      .value {{ this.ratToNumber(votes.no_with_veto) }}
  .chart-legend(v-else :class="chartLabelClass")
    .kv.abstain {{ this.ratToNumber(votes.abstain) }}
    .kv.yes {{ this.ratToNumber(votes.yes) }}
    .kv.no_with_veto {{ this.ratToNumber(votes.no_with_veto) }}
    .kv.no {{ this.ratToNumber(votes.no) }}
</template>

<script>
import { mapGetters } from "vuex"
import Chart from "chart.js"
const BN = require(`bignumber.js`).BigNumber
export default {
  name: `chart-votes`,
  props: [`votes`, `size`],
  computed: {
    ...mapGetters([`themes`]),
    yes() {
      return this.ratToNumber(votes.yes)
    },
    no() {
      return this.ratToNumber(votes.no)
    },
    abstain() {
      return this.ratToNumber(votes.abstain)
    },
    noWithVeto() {
      return this.ratToNumber(votes.no_with_veto)
    },
    cssClass() {
      if (this.size === `lg`) {
        return `chart-votes-size-lg`
      } else {
        return `chart-votes-size-sm`
      }
    },
    chartLabel() {
      let data = this.chartData.datasets[0].data
      return Math.max.apply(Math, data)
    },
    chartLabelClass() {
      let data = this.chartData.datasets[0].data
      let index = data.indexOf(Math.max.apply(Math, data))
      switch (index) {
        case 0:
          return `yes`
        case 1:
          return `no`
        default:
          return `no_with_veto`
      }
    },
    chartData() {
      let abstainBgColor
      if (this.themes.active === `dark`) {
        abstainBgColor = `#FFFFFF`
      } else {
        abstainBgColor = `#000000`
      }
      return {
        labels: [`Yes`, `No`, `No with veto`, `Abstain`],
        datasets: [
          {
            borderWidth: 0,
            data: this.chartValues,
            backgroundColor: [
              abstainBgColor,
              `hsl(233,96%,60%)`,
              `hsl(326,96%,59%)`,
              `hsl(233,13%,50%)`
            ]
          }
        ]
      }
    },
    chartValues() {
      let values = []
      for (let v in this.votes) {
        values.push(this.votes[v])
      }
      return values
    }
  },
  data: () => ({
    chartOptions: {
      animation: { duration: 0 },
      cutoutPercentage: 92,
      legend: { display: false },
      responsive: true,
      maintainAspectRatio: false
    }
  }),
  methods: {
    ratToNumber(rat) {
      let idx = rat.indexOf(`/`)
      if (idx == -1) {
        return Number(rat)
      }
      rat = rat.split("/")
      let n = new BN(rat[0])
      let d = new BN(rat[1])

      return n
        .div(d)
        .toNumber()
        .toFixed(0)
    },
    drawChart() {
      let ctx = this.$el.querySelector(`canvas`)
      new Chart(ctx, {
        type: `doughnut`,
        data: this.chartData,
        options: this.chartOptions
      })
    }
  },
  mounted() {
    this.drawChart()
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
      width 6rem
      height 6rem

    .chart-legend
      position absolute
      top 0
      left 0
      width 6rem
      height 6rem
      display flex
      flex-flow row wrap
      align-items center
      justify-content center
      padding-right 8rem

      .kv
        width 1rem
        height 1rem
        font-size xs
        font-weight 500
        text-align center

        &.abstain
          color var(--dim)

        &.yes
          color var(--success)

        &.no
          color var(--danger)

        &.no_with_veto
          color var(--darkred)

  &.chart-votes-size-lg
    .chart-canvas
      width 15rem
      height 15rem
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
          color var(--success)

        &.no .value
          color var(--danger)

        &.no_with_veto .value
          color var(--danger-bc)

        .container
          flex 1
          display flex
          flex-flow column nowrap
          align-items center
          justify-content center
          border-top 0.25rem solid var(--bc)

        .key
          border-bottom px dotted var(--bc)
          height 2rem - 4 * px
          width 100%
          display flex
          align-items center
          justify-content center
          font-size xs
          color var(--dim)
          text-transform uppercase

        .value
          flex 1
          color var(--txt)
          font-size xl
          display flex
          align-items center
          justify-content center
</style>
