<template>
  <button
    class="button"
    :class="{ secondary: type === `secondary` }"
    :disabled="disabled"
  >
    {{ value }}
  </button>
</template>

<script>
export default {
  name: `TmBtn`,
  props: {
    value: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.button {
  font-family: var(--sans);
  font-size: 14px !important;
  font-weight: 400;
  padding: 8px 16px;
  min-width: 100px;
  color: var(--bright) !important;
  margin: 0;
  border-radius: 0.5rem;
  cursor: pointer;
  background: var(--primary);
  border: 2px solid var(--primary);
  transition: all 0.5s ease;
  white-space: nowrap;
}

.button:hover {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
}

.button:disabled {
  opacity: 0.5;
  background: var(--bc);
  border-color: var(--bc-dim);
  cursor: default;
}

.button:disabled:hover {
  background: var(--bc);
  border-color: var(--bc-dim);
}

.button.secondary {
  background: var(--primary-alpha);
}
</style>
