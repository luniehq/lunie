<template>
  <div
    v-tooltip="tooltipText"
    class="copyable-address"
    :class="{
      'with-type': !!addressType,
    }"
  >
    <div
      v-clipboard:copy="address"
      v-clipboard:success="() => onCopy()"
      class="address"
    >
      <div class="address-section">
        <span v-if="addressType" class="type"> {{ addressType }} Address </span>
        <span>{{ address | formatAddress }}</span>
      </div>
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
    addressType: {
      type: String,
      default: undefined,
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
  height: 2rem;
  padding: 0 1rem;
  border-radius: 1rem;
  margin: 0;
  background: var(--app-fg);
}

.copyable-address.with-type {
  height: 2.5rem;
}

.copyable-address .type {
  font-size: 10px;
  line-height: 10px;
  color: var(--dim);
  margin-top: 1px;
}

.copyable-address .address {
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: var(--link);
}

.copyable-address .address-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
