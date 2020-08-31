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

<style>
.status {
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 10px;
  font-weight: 600;
  padding: 0.25rem 1rem;
  border-radius: 1rem;
  color: var(--bright);
  border: 2px solid;
  width: fit-content;
}

.status.Rejected {
  border-color: var(--danger);
}

.status.DepositPeriod {
  border-color: var(--warning);
}

.status.Passed {
  border-color: var(--success);
}

.status.VotingPeriod {
  border-color: var(--highlight);
}
</style>
