<template>
  <div class="status" :class="status">
    {{ status }}
  </div>
</template>

<script>
export default {
  name: `Status`,
  props: {
    status: {
      type: String,
      required: true,
    },
  },
}
</script>

<style lang="scss">
.status {
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 0.25rem;
  color: var(--bright);
  background: var(--bc-dim);
}

.status.rejected {
  background: var(--danger);
}

.status.DepositPeriod {
  background: var(--warning);
}

.status.passed {
  background: var(--success);
}

.status.VotingPeriod {
  background: var(--highlight);
}
</style>