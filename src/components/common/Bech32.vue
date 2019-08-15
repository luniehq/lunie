<template>
  <div class="bech32-address">
    <div
      id="address"
      v-tooltip.top="`Click to copy`"
      v-clipboard:copy="address"
      v-clipboard:success="() => onCopy()"
      class="address"
    >
      {{ address | formatBech32(longForm) }}
    </div>
    <div :class="{ active: copySuccess }" class="copied">
      <i class="material-icons">check</i>
    </div>
  </div>
</template>

<script>
import { formatBech32 } from "src/filters"

export default {
  name: `bech32-address`,
  filters: {
    formatBech32
  },
  props: {
    address: {
      type: String,
      required: true
    },
    longForm: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: () => ({
    copySuccess: false
  }),
  methods: {
    onCopy() {
      this.copySuccess = true
      setTimeout(() => {
        this.copySuccess = false
      }, 2500)
    }
  }
}
</script>
<style>
.bech32-address {
  align-items: flex-start;
  display: inline-flex;
  padding: 0;
  margin: 0;
  font-size: inherit;
}

.bech32-address .address {
  color: var(--link);
  cursor: pointer;
  white-space: nowrap;
}

.bech32-address .address:hover {
  color: var(--link-hover);
}

.bech32-address .copied {
  align-items: flex-end;
  display: flex;
  font-size: 10px;
  opacity: 0;
  padding-left: 0.25rem;
  padding-top: 2px;
  transition: opacity 500ms ease;
}

.bech32-address .copied.active {
  opacity: 1;
}

.bech32-address .copied i {
  color: var(--success);
  font-size: 12px;
  padding-bottom: 2px;
  padding-right: 0;
}
</style>
