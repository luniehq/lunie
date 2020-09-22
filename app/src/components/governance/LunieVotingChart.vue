<script>
import { Doughnut, mixins } from "vue-chartjs"
export default {
  extends: Doughnut,
  mixins: [mixins.reactiveProp],
  props: {
    voteValues: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    this.renderChart(
      {
        labels: [`Yes`, `No`, `NoWithVeto`, `Abstain`],
        datasets: [
          {
            label: `Voting`,
            backgroundColor: ["#22ce22", `#ff1a1a`, `#ef752e`, `#b3b3b3`],
            data: this.voteValues,
          },
        ],
      },
      { legend: { display: false } }
    )
  },
}
</script>

<style scoped>
#doughnut-chart {
  width: unset;
  height: unset;
  max-width: 30rem;
}
</style>
