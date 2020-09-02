<template>
  <section class="status-bar">
    <div v-if="status === `Deposit Period`">
      <div class="top row">
        <div class="time">Entered Deposit Period on {{ statusBeginTime }}</div>
        <div>ID: {{ proposalId }}</div>
      </div>
      <div v-if="depositCount">{{ depositCount }} Deposits</div>
      <ProgressBar
        size="large"
        :val="depositPercentage"
        :bar-border-radius="8"
        bar-color="var(--highlight)"
      />
      <div class="bottom row">
        <div>{{ depositPercentage + `%` }}</div>
        <div>{{ depositTotal }}</div>
      </div>
    </div>
    <div v-if="status === `Voting Period`">
      <div class="top row">
        <div class="time">Entered Voting Period on {{ statusBeginTime }}</div>
        <div>ID: {{ proposalId }}</div>
      </div>
      <div v-if="voteCount">{{ voteCount }} Votes</div>
      <ProgressBar
        size="large"
        :val="votePercentage"
        :bar-border-radius="8"
        bar-color="var(--highlight)"
      />
      <div class="bottom row">
        <div>{{ votePercentage + `%` }} of {{ stakingDenom }}s</div>
        <div class="row votes">
          <div>Yes Votes: {{ yesVotes }} {{ stakingDenom }}s</div>
          <div>No Votes: {{ noVotes }} {{ stakingDenom }}s</div>
          <div v-if="vetoVotes > 0">Veto Votes: {{ vetoVotes }}</div>
          <div v-if="abstainVotes > 0">Abstain Votes: {{ abstainVotes }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from "vuex"
import ProgressBar from "vue-simple-progress"

export default {
  name: `proposal-status-bar`,
  components: {
    ProgressBar,
  },
  props: {
    status: {
      type: String,
      required: true,
    },
    statusBeginTime: {
      type: String,
      default: `n/a`,
    },
    proposalId: {
      type: String,
      default: `n/a`,
    },
    depositCount: {
      type: String,
      default: null,
    },
    voteCount: {
      type: String,
      default: null,
    },
    depositPercentage: {
      type: Number,
      default: 0,
    },
    votePercentage: {
      type: Number,
      default: 0,
    },
    depositTotal: {
      type: String,
      default: `n/a`,
    },
    voteTotal: {
      type: String,
      default: `n/a`,
    },
    yesVotes: {
      type: Number,
      required: true,
    },
    noVotes: {
      type: Number,
      required: true,
    },
    vetoVotes: {
      type: Number,
      default: 0,
    },
    abstainVotes: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapGetters([`stakingDenom`]),
  },
}
</script>

<style scoped>
.status-bar {
  width: 100%;
  padding: 2rem 0;
  font-size: 14px;
  max-width: 1024px;
  margin: 0 auto;
}

.top {
  padding-bottom: 2rem;
}

.bottom {
  padding-top: 1rem;
  font-size: 14px;
  font-weight: 400;
}

.row {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
}

.votes div {
  padding-left: 1.5rem;
  font-size: 14px;
}
</style>
