<template>
  <section class="status-bar">
    <div v-if="depositPeriod">
      <span>Entered Deposit Period on {{ date }}</span>
      <div>{{ depositCount }} Deposits</div>
      <ProgressBar />
      <div>{{ totalDeposited }}</div>
      <div>{{ depositPercentage }}</div>
    </div>
    <div v-if="votingPeriod">
      <span>Entered Voting Period on {{ date }}</span>
      <div>{{ voteCount }} Votes</div>
      <ProgressBar />
      <div>{{ totalVotes }}</div>
      <div>{{ votePercentage }}</div>
    </div>
  </section>
</template>

<script>
import ProgressBar from "vue-simple-progress"

export default {
  name: `proposal-status-bar`,
  components: {
    ProgressBar,
  },
  data: () => ({
    id: `27`,
    date: `July 12, 2020`,
    depositCount: `55`,
    voteCount: `280`,
    depositPeriod: false,
    votingPeriod: true,
    totalDeposited: `512 ATOM`,
    depositPercentage: `100%`,
    totalVotes: `85,347,116 ATOM`,
    votePercentage: `46%`,
  }),
}
</script>

<style scoped>
.status-bar {
  width: 100%;
  padding: 2rem;
}
</style>
