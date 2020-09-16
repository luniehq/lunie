<template>
  <section class="status-bar">
    <div v-if="status.value === governanceStatusEnum.DEPOSITING">
      <div v-if="statusBeginTime" class="top row">
        <div class="time">
          Entered {{ status.title }} on {{ statusBeginTime | moment }}
        </div>
        <div>ID: {{ proposal.proposalId }}</div>
      </div>
      <div v-if="depositCount">{{ depositCount }} Deposits</div>
      <ProgressBar
        size="large"
        :val="depositPercentage"
        :bar-border-radius="8"
        bar-color="var(--highlight)"
      />
      <div class="bottom row">
        <div>{{ depositPercentage ? depositPercentage + `%` : "" }}</div>
        <div>{{ depositTotal }}</div>
      </div>
    </div>
    <div v-if="status.value === governanceStatusEnum.VOTING">
      <div class="top row">
        <div class="time">
          Entered Voting Period on {{ new Date(statusBeginTime).toUTCString() }}
        </div>
        <div>ID: {{ proposal.proposalId }}</div>
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
          <div>Yes Votes: {{ proposal.tally.yes }} {{ stakingDenom }}s</div>
          <div>No Votes: {{ proposal.tally.no }} {{ stakingDenom }}s</div>
          <div v-if="proposal.tally.veto > 0">
            Veto Votes: {{ proposal.tally.veto }}
          </div>
          <div v-if="proposal.tally.abstain > 0">
            Abstain Votes: {{ proposal.tally.abstain }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from "vuex"
import moment from "moment"
import { governanceStatusEnum } from "scripts/proposal-status"
import ProgressBar from "vue-simple-progress"

export default {
  name: `proposal-status-bar`,
  components: {
    ProgressBar,
  },
  filters: {
    moment,
  },
  props: {
    status: {
      type: Object,
      required: true,
    },
    statusBeginTime: {
      type: String,
      default: `n/a`,
    },
    proposal: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    governanceStatusEnum,
  }),
  computed: {
    ...mapGetters([`stakingDenom`]),
    voteCount() {
      return this.proposal.detailedVotes.votesSum
    },
    votePercentage() {
      return this.proposal.tally.totalVotedPercentage
    },
    depositCount() {
      return this.proposal.detailedVotes.deposits.length
    },
    depositTotal() {
      return this.proposal.detailedVotes.depositsSum
    },
    depositPercentage() {
      return this.proposal.detailedVotes.percentageDepositsNeeded
    },
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
