<template>
  <div class="short-bech32">
    <div
      v-if="!longForm"
      id="address"
      v-tooltip.top="address"
      v-clipboard:copy="address"
      v-clipboard:success="() => onCopy()"
      class="address"
    >
      {{ shortBech32 }}
    </div>
    <div
      v-else
      id="address"
      v-clipboard:copy="address"
      v-clipboard:success="() => onCopy()"
      class="address"
    >
      {{ bech32 }}
    </div>
    <div :class="{ active: copySuccess }" class="copied">
      <i class="material-icons">check</i><span>Copied</span>
    </div>
  </div>
</template>

<script>
export default {
  name: `short-bech32`,
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
  computed: {
    shortBech32({ address } = this, length = 4) {
      if (!address) return `Address Not Found`
      if (address.indexOf(`1`) === -1) {
        return `Not A Valid Bech32 Address`
      } else {
        return address.split(`1`)[0] + `…` + address.slice(-1 * length)
      }
    },
    bech32({ address } = this) {
      if (!address) return `Address Not Found`
      if (address.indexOf(`1`) === -1) {
        return `Not A Valid Bech32 Address`
      } else {
        return address
      }
    }
  },
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
.short-bech32 {
  align-items: flex-start;
  display: inline-flex;
  padding: 0;
  margin: 0;
}

.short-bech32 .address {
  color: var(--link);
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.short-bech32 .address:hover {
  color: var(--link-hover);
}

.short-bech32 .copied {
  align-items: flex-end;
  display: flex;
  font-size: var(--sm);
  opacity: 0;
  padding-left: 10px;
  padding-top: 2px;
  transition: opacity 500ms ease;
}

.short-bech32 .copied.active {
  opacity: 1;
}

.short-bech32 .copied i {
  color: var(--success);
  font-size: var(--m);
  padding-bottom: 2px;
  padding-right: 0;
}
</style>
