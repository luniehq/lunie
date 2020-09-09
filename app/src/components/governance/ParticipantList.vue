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
            <img src="https://lunie.fra1.digitaloceanspaces.com/polkadot.png" />
            <!-- {{ participant.icon || `n/a` }} -->
          </span>
          <span class="name">{{ participant.name || `n/a` }}</span>
        </div>
        <span class="voter">{{
          participant.voter.address || participant.address | formatAddress
        }}</span>
        <div>
          <span class="option">{{ participant.option || `n/a` }}</span>
          <span class="amount">{{ participant.amount || `n/a` }}</span>
        </div>
        <span class="time">{{ participant.time || `n/a` }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
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
  mounted() {
    console.log(this.participants)
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
}

.name,
.option,
.amount {
  color: var(--bright);
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
