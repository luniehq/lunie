<template>
  <div class="participant-container">
    <h4>{{ title }}</h4>
    <ul>
      <li
        v-for="(participant, index) in showingParticipants"
        :key="index"
        class="participant"
      >
        <div class="first-column">
          <span class="icon">
            <img v-if="participant.picture" :src="participant.picture" />
            <img v-else :src="currentNetwork.icon" />
          </span>
          <span v-if="participant.name" class="name">{{
            participant.name
          }}</span>
          <span v-else class="name">{{
            participant.address | formatAddress
          }}</span>
        </div>
        <template v-if="participant.votingPower">
          <div v-if="currentNetwork.network_type === `cosmos`">
            {{ participant.votingPower | bigFigureOrPercent }}
          </div>
          <div v-else>
            {{ participant.votingPower | bigFigureOrPercent }}
          </div>
        </template>
        <div v-if="showAmounts && participant.option">
          <span class="option">{{ participant.option }}</span>
        </div>
        <div v-if="showAmounts && participant.amount">
          <span class="amount"
            >{{ participant.amount.amount | prettyInt }}
            {{ participant.amount.denom }}</span
          >
        </div>
      </li>
    </ul>
    <div v-if="moreAvailable" class="loadmore-button-container">
      <TmBtn
        id="loadMoreBtn"
        value="Load More"
        type="secondary"
        @click.native="loadMore"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { formatAddress } from "src/filters"
import { bigFigure, bigFigureOrPercent } from "scripts/num"
import { prettyInt } from "src/scripts/num"
import TmBtn from "src/components/common/TmBtn"

export default {
  name: `participant-list`,
  components: {
    TmBtn,
  },
  filters: {
    formatAddress,
    bigFigure,
    bigFigureOrPercent,
    prettyInt,
  },
  props: {
    title: {
      type: String,
      default: `Participant List`,
    },
    participants: {
      type: Array,
      required: true,
    },
    showAmounts: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    showing: 5,
    maxReached: false,
  }),
  computed: {
    ...mapGetters([`currentNetwork`]),
    showingParticipants() {
      return JSON.parse(JSON.stringify(this.participants))
        .sort((a, b) => !!b.picture - !!a.picture)
        .slice(0, this.showing)
    },
    moreAvailable() {
      return this.showingParticipants.length < this.participants.length
    },
  },
  methods: {
    loadMore() {
      if (!this.maxReached) {
        this.showing += 5

        if (
          this.showing > this.participants.length - 100 &&
          !this.moreAvailable
        ) {
          this.maxReached = true
        }
      }
    },
  },
}
</script>

<style scoped>
.participant-container {
  padding: 4rem 0;
  max-width: 1024px;
  margin: 0 auto;
  width: 100%;
}

h4 {
  font-size: 12px;
  padding-bottom: 1rem;
  color: var(--dim);
}

.first-column {
  min-width: 30%;
}

.participant {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 0;
  font-size: 14px;
}

.participant div {
  display: flex;
  align-items: center;
  max-width: 33%;
  width: 100%;
  justify-content: flex-end;
}

.participant div:first-child {
  justify-content: flex-start;
}

.name,
.option,
.amount {
  color: var(--bright);
  margin-right: 0.5rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: scroll;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.icon,
.option {
  margin-right: 1rem;
}

.name::-webkit-scrollbar,
.option::-webkit-scrollbar,
.amount::-webkit-scrollbar {
  display: none;
}

.voter,
.time {
  color: var(--dim);
}

.icon {
  height: 2.25rem;
  width: 2.25rem;
}

.icon img {
  border: 2px solid var(--bc);
  height: 2.25rem;
  width: 2.25rem;
  border-radius: 50%;
}

.loadmore-button-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0 0;
}
</style>
