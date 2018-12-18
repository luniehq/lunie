<template>
  <div class="tm-hardware-state">
    <i :class="iconClass" class="tm-hardware-state__icon material-icons">{{
      icon
    }}</i>
    <div class="tm-hardware-state__label">{{ value }}</div>
  </div>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      required: true
    },
    spin: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      required: true
    }
  },
  computed: {
    iconClass() {
      if (this.spin) {
        return `fa-spin`
      }
    }
  }
}
</script>

<style>
.tm-hardware-state {
  background: var(--app-fg);
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  margin: 1.5rem auto;
  height: 15rem;
  width: 15rem;
  padding: 1.5rem;
  user-select: none;
}

.tm-hardware-state .tm-hardware-state__icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  color: var(--dim);
}

.tm-hardware-state .tm-hardware-state__label {
  text-align: center;
  color: var(--txt);
}
</style>
