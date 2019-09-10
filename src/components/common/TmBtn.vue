<template>
  <button
    class="button"
    :class="{ secondary: type === `secondary`, small: size === `small` }"
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
    size: {
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
  font-size: 14px;
  font-weight: 400;
  padding: 8px 16px;
  min-width: 100px;
  color: var(--bright);
  margin: 0;
  border-radius: 0.5rem;
  cursor: pointer;
  background: var(--primary);
  border: 2px solid var(--primary);
  transition: all 0.5s ease;
  white-space: nowrap;
  outline: none;
}

.button:hover {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
}

.button:disabled {
  opacity: 0.5;
  background: var(--primary-dark);
  border-color: var(--bc-dim);
  cursor: default;
}

.button:disabled:hover {
  background: var(--primary-dark);
  border-color: var(--bc-dim);
}

.button.secondary {
  background: var(--primary-alpha);
}

.button.secondary:hover {
  background: var(--primary-alpha);
}

.button.secondary.small {
  padding: 6px 10px;
  font-size: 12px;
  min-width: 0;
  color: var(--dim);
  border-color: var(--bc);
  background-color: transparent;
}

.button.secondary.small:hover {
  background-color: var(--bc-dim);
}

@media screen and (max-width: 1023px) {
  .button.secondary.small {
    padding: 10px 10px;
  }
}

.addon-max {
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 400;
  padding: 4px 16px;
  min-width: 100px;
  color: var(--bright);
  margin: 0;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  border-top-right-radius: 0.25rem !important;
  border-bottom-right-radius: 0.25rem !important;
  cursor: pointer;
  background: var(--primary);
  border: 2px solid var(--primary);
  transition: all 0.5s ease;
  white-space: nowrap;
  outline: none;
}

.addon-max:hover {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
}

.addon-max:disabled {
  opacity: 0.5;
  background: var(--primary-dark);
  border-color: var(--bc-dim);
  cursor: default;
}

.addon-max:disabled:hover {
  background: var(--primary-dark);
  border-color: var(--bc-dim);
}

.input-suffix-denom {
  background: var(--bc-dim);
  display: inline-block;
  position: absolute;
  padding: 7px 8px;
  font-size: var(--sm);
  text-transform: uppercase;
  right: 124px;
  letter-spacing: 1px;
  text-align: right;
  font-weight: 500;
  border-radius: 2px;
}

</style>
