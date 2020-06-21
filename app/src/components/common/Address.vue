<template>
  <div v-tooltip="tooltipText" class="copyable-address">
    <div
      v-clipboard:copy="address"
      v-clipboard:success="() => onCopy()"
      class="address"
    >
      <span>{{ address | formatAddress }}</span>
      <div :class="{ active: copySuccess }" class="icon-container">
        <i class="material-icons notranslate success">check</i>
      </div>
      <i class="material-icons notranslate copy">content_copy</i>
    </div>
  </div>
</template>

<script>
import { formatAddress } from "src/filters"

export default {
  name: `lunie-address`,
  filters: {
    formatAddress,
  },
  props: {
    address: {
      type: String,
      required: true,
    },
    tooltipText: {
      type: String,
      default: ``,
    },
  },
  data: () => ({
    copySuccess: false,
  }),
  methods: {
    onCopy() {
      this.copySuccess = true
      setTimeout(() => {
        this.copySuccess = false
      }, 2500)
    },
  },
}
</script>
<style scoped>
.copyable-address {
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  height: 2rem;
  padding: 0 1rem;
  border-radius: 1rem;
  margin: 0;
  background: var(--app-fg);
}

.copyable-address .address {
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: var(--link);
}

.menu-address .address {
  color: var(--menu-link);
}

.copyable-address .address:hover {
  color: var(--link-hover);
}

.menu-address .address:hover {
  color: var(--menu-link-hover);
}

.copyable-address .icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.copyable-address .icon-container .success {
  opacity: 0;
  transition: opacity 250ms ease;
}

.copyable-address .icon-container.active .success {
  opacity: 1;
}

.copyable-address i {
  font-size: 14px;
  padding-left: 0.25rem;
}

.copyable-address .icon-container i.success {
  color: var(--success);
}

.material-icons {
  font-size: 14px;
}
</style>
