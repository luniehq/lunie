<template>
  <div v-if="showMessage" :class="`bar ${barType}`">
    <p>
      <slot />
    </p>
    <i class="material-icons close-icon" @click="close()">close</i>
  </div>
</template>

<script>
export default {
  name: `bar`,
  props: {
    barType: {
      type: String,
      default: "primary"
    },
    show: Boolean
  },
  data: function() {
    return {
      showMessage: this.show
    }
  },
  methods: {
    close() {
      this.showMessage = false
    }
  }
}
</script>

<style scoped>
.bar {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  font-family: var(--sans);
  background-color: transparent;
  font-size: 14px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--bright);
}

.bar.primary {
  background-color: var(--primary);
}

.bar.success {
  background-color: var(--success);
}

.bar.warning {
  background-color: var(--warning);
}

.bar.danger {
  background-color: var(--danger);
}

.bar.info {
  background-color: var(--info);
}

.bar .link {
  text-decoration: underline;
  color: var(--bright);
  cursor: pointer;
}

.close-icon {
  cursor: pointer;
  font-size: 18px;
  padding-left: 1rem;
}
</style>
