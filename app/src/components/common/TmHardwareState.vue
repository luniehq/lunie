<template>
  <div class="tm-hardware-state">
    <div class="tm-hardware-state-content">
      <img
        v-if="loading"
        src="~assets/images/loader.svg"
        alt="a small spinning circle to display loading"
        class="tm-hardware-state__icon"
      />
      <i v-else-if="icon" class="tm-hardware-state__icon material-icons">
        {{ icon }}
      </i>
      <div class="tm-hardware-state__label">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: ``,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped>
.tm-hardware-state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--app-fg);
  margin: 1.5rem auto 0;
  padding: 1.5rem;
  user-select: none;
  border-radius: 0.25rem;
}

.tm-hardware-state-content {
  display: flex;
  align-items: center;
}

.tm-hardware-state__icon {
  font-size: 1.5rem;
  padding-right: 1rem;
  color: var(--dim);
}

.tm-hardware-state__label {
  color: var(--bright);
  margin-right: 1rem;
}
</style>
