<template>
  <div class="status" :class="status.color">
    {{ status.title }}
  </div>
</template>

<script>
export default {
  name: `Status`,
  props: {
    status: {
      type: Object,
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
  color: var(--txt);
  border: 2px solid;
  width: fit-content;
}

.status.red {
  border-color: var(--danger);
}

.status.orange {
  border-color: var(--warning);
}

.status.green {
  border-color: var(--success);
}

.status.highlight {
  border-color: var(--highlight);
}

.status.grey {
  border-color: var(--dim);
}
</style>
