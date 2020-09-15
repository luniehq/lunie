<template>
  <div class="participant-container">
    <h4>{{ title }}</h4>
    <ul>
      <li
        v-for="(participant, index) in participants"
        :key="index"
        class="participant"
      >
        <div class="first-column">
          <span class="icon">
            <img :src="currentNetwork.icon" />
          </span>
          <span class="name">{{ getParticipantName(participant) }}</span>
        </div>
        <span class="voter">{{ participant.address | formatAddress }}</span>
        <div>
          <span v-if="!showAmounts && participant.option" class="option">{{
            participant.option
          }}</span>
        </div>
        <div v-if="!showAmounts && participant.amount">
          <span class="amount">{{ participant.amount.amount }}</span>
          <span>{{ participant.amount.denom.concat(`s`) }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { formatAddress } from "src/filters"

export default {
  name: `participant-list`,
  filters: {
    formatAddress,
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
  },
  computed: {
    ...mapGetters([`currentNetwork`]),
    showAmounts() {
      return ["Council Members", "Top Voters"].includes(this.title)
        ? true
        : false
    },
  },
  methods: {
    getParticipantName(participant) {
      const name = participant.name
      return name.length > 25 ? formatAddress(name) : name || `n/a`
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
  width: 2rem;
}

.name,
.option,
.amount {
  color: var(--bright);
  margin-right: 0.5rem;
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

.icon,
.option {
  margin-right: 1rem;
}
</style>
