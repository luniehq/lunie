<template>
  <button
    class="button"
    :class="{
      secondary: type === `secondary`,
      small: size === `small`,
      active: type === `active`,
      sidebar: type === `sidebar`
    }"
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
  width: auto;
  min-width: 100px;
  color: var(--menu-bright);
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
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.button:disabled {
  opacity: 0.6;
  background: var(--dim);
  border-color: var(--dim);
  cursor: default;
}

.button:disabled:hover {
  background: var(--dim);
  border-color: var(--dim);
}

.button.secondary.active {
  background: var(--primary);
  color: var(--menu-bright);
}

.button.secondary {
  color: var(--bright);
  background: transparent;
  border-color: var(--primary-hover);
}

.button.small {
  padding: 6px 10px;
  font-size: 12px;
  min-width: 0;
  color: var(--menu-text);
  border-color: var(--bc);
  background-color: transparent;
}

.button.small:hover {
  background: var(--app-nav-hover);
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
  background: transparent;
  border: 2px solid var(--primary);
  white-space: nowrap;
  outline: none;
}

.addon-max:hover {
  background: transparent;
  border-color: var(--primary-hover);
}

.addon-max:disabled {
  opacity: 0.5;
  background: var(--primary);
  border-color: var(--primary);
  cursor: default;
}

.addon-max:disabled:hover {
  background: var(--primary);
  border-color: var(--primary);
}
</style>
