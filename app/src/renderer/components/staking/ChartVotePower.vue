<template lang='pug'>
.chart-container: canvas(:id="id")
</template>

<script>
import { mapGetters } from "vuex"
import Chart from "chart.js"
import shortid from "shortid"
export default {
  name: "chart-power",
  props: ["votes", "size"],
  computed: {
    ...mapGetters(["bondingDenom"]),
    chartData() {
      return {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec"
        ],
        datasets: [
          {
            label: "Delegated " + this.bondingDenom,
            lineTension: 0,
            borderColor: "hsl(330,100%,30%)",
            borderWidth: 2,
            backgroundColor: "hsla(330,100%,10%, 0.33)",
            pointBackgroundColor: "hsl(330,100%,50%)",
            pointBorderWidth: 0,
            pointStyle: "rect",
            data: [
              2.13,
              2.43,
              2.34,
              2.11,
              2.69,
              2.45,
              2.85,
              2.7,
              2.5,
              3.1,
              3.5,
              3.2
            ]
          },
          {
            label: "Solo " + this.bondingDenom.toUpperCase(),
            lineTension: 0,
            borderColor: "hsl(210,50%,30%)",
            borderWidth: 2,
            backgroundColor: "hsla(210,100%,10%, 0.33)",
            pointBackgroundColor: "hsl(210,50%,50%)",
            pointBorderWidth: 0,
            pointStyle: "rect",
            data: [
              0.56,
              0.6,
              0.71,
              0.63,
              0.69,
              0.72,
              0.65,
              0.77,
              0.7,
              0.8,
              0.9,
              1
            ]
          }
        ]
      }
    }
  },
  data: () => ({
    id: "chart-power-" + shortid.generate(),
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 16,
          right: 16,
          top: 16,
          bottom: 16
        }
      },
      legend: {
        display: false,
        position: "top",
        labels: {
          boxWidth: 20,
          fontColor: "hsl(210, 32%, 50%)"
        }
      },
      scales: {
        xAxes: [
          {
            gridLines: { color: "hsl(210, 18%, 12%)" },
            ticks: {
              fontColor: "hsl(210, 32%, 50%)",
              fontFamily:
                '-apple-system, ".SFNSText-Regular", "San Francisco", "Roboto", "Segoe UI", "Helvetica Neue", "Lucida Grande", sans-serif'
            }
          }
        ],
        yAxes: [
          {
            gridLines: { color: "hsl(210, 18%, 12%)" },
            ticks: {
              fontColor: "hsl(210, 32%, 50%)",
              fontFamily:
                '-apple-system, ".SFNSText-Regular", "San Francisco", "Roboto", "Segoe UI", "Helvetica Neue", "Lucida Grande", sans-serif'
            },
            stacked: true
          }
        ]
      },
      tooltips: {
        enabled: true,
        mode: "single"
      }
    }
  }),
  mounted() {
    let ctx = document.querySelector("#" + this.id)
    // eslint-disable-next-line
    let chart = new Chart(ctx, {
      type: "line",
      data: this.chartData,
      options: this.chartOptions,
      height: 256
    })
  }
}
</script>

<style lang='stylus'>
@require '~variables'

.chart-container
  position relative
  height 16rem
  border-bottom px solid var(--bc)
</style>
