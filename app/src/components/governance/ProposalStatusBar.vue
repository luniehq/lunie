<template>
  <section id="proposal-votes" class="status-bar">
    <div v-if="status.value === governanceStatusEnum.DEPOSITING">
      <div class="top row">
        <div v-if="statusBeginTime" class="time">
          Entered {{ status.title }} {{ statusBeginTime | moment }}
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
        <div>{{ depositPercentage | prettyInt }}%</div>
        <div>{{ depositTotal }} {{ stakingDenom }}</div>
      </div>
    </div>
    <div v-if="status.value === governanceStatusEnum.VOTING">
      <div class="top row">
        <div v-if="statusBeginTime" class="time">
          Entered Voting Period {{ new Date(statusBeginTime) | moment }}
        </div>
        <div>ID: {{ proposal.proposalId }}</div>
      </div>
      <div class="vote-data-container">
        <div class="vote-data">
          <span>{{ votePercentage | percentInt }} of {{ stakingDenom }}</span>
          <span v-if="voteCount">({{ voteCount }} Votes)</span>
        </div>
      </div>
      <ProgressBar
        size="large"
        :val="proposal.detailedVotes.votingThresholdYes"
        :bar-border-radius="8"
        bar-color="var(--highlight)"
      />
    </div>
    <div
      v-if="status.value !== governanceStatusEnum.DEPOSITING"
      class="bottom row"
    >
      <div class="row votes">
        <div class="yes vote-box">
          <div>
            <span class="dot">Yes</span>
            <span>{{ percentageYes | percent }}</span>
          </div>
          <span class="bottom-row"
            >{{ proposal.tally.yes | prettyInt }} {{ stakingDenom }}</span
          >
        </div>
        <div class="no vote-box">
          <div>
            <span class="dot">No</span>
            <span>{{ percentageNo | percent }}</span>
          </div>
          <span class="bottom-row"
            >{{ proposal.tally.no | prettyInt }} {{ stakingDenom }}</span
          >
        </div>
        <div v-if="proposal.tally.veto > 0" class="veto vote-box">
          <div>
            <span class="dot">Veto</span>
            <span>{{ percentageVeto | percent }}</span>
          </div>
          <span class="bottom-row"
            >{{ proposal.tally.veto | prettyInt }} {{ stakingDenom }}</span
          >
        </div>
        <div v-if="proposal.tally.abstain > 0" class="abstain vote-box">
          <div>
            <span class="dot">Abstain</span>
            <span>{{ percentageAbstain | percent }}</span>
          </div>
          <span class="bottom-row"
            >{{ proposal.tally.abstain | prettyInt }} {{ stakingDenom }}</span
          >
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
import { prettyInt, percentInt, percent } from "src/scripts/num"

export default {
  name: `proposal-status-bar`,
  components: {
    ProgressBar,
  },
  filters: {
    moment: function (date) {
      return moment(date).fromNow()
    },
    prettyInt,
    percentInt,
    percent,
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
    totalVotes() {
      return this.proposal.detailedVotes.votesSum
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
    percentageYes() {
      return (
        Number(this.proposal.tally.yes) / Number(this.proposal.tally.total) || 0
      )
    },
    percentageNo() {
      return (
        Number(this.proposal.tally.no) / Number(this.proposal.tally.total) || 0
      )
    },
    percentageVeto() {
      return (
        Number(this.proposal.tally.veto) / Number(this.proposal.tally.total) ||
        0
      )
    },
    percentageAbstain() {
      return (
        Number(this.proposal.tally.abstain) /
          Number(this.proposal.tally.total) || 0
      )
    },
  },
}
</script>

<style scoped>
.time {
  text-transform: capitalize;
}

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

.vote-data-container {
  display: flex;
  justify-content: space-between;
}

.vote-data {
  padding-bottom: 1rem;
  font-size: 12px;
}

.vote-data span {
  padding-right: 0.5rem;
}

.votes {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.vote-box {
  width: 100%;
  padding: 0.5rem 0.75rem;
  margin-top: 2rem;
  margin-right: 1rem;
  color: var(--txt);
  font-size: 12px;
  letter-spacing: 0.5px;
  border: 2px solid var(--bc);
  border-radius: 0.25rem;
}

.vote-box:last-child {
  margin-right: 0;
}

.vote-box div {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.dot {
  color: var(--bright);
  font-weight: 500;
  font-size: 14px;
}

.dot::before {
  display: inline-block;
  content: "";
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.yes .dot::before {
  background: var(--success);
}

.no .dot::before {
  background: var(--danger);
}

.veto .dot::before {
  background: var(--warning);
}

.abstain .dot::before {
  background: var(--dim);
}

.bottom-row {
  padding-top: 0.5rem;
  display: block;
}

@media screen and (max-width: 1023px) {
  .votes {
    flex-direction: column;
  }

  .vote-box,
  .vote-box:last-child {
    margin: 0.5rem 1rem;
  }
}
</style>
