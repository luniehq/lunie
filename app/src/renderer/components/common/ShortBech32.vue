<template>
  <div class="short-bech32">
    <div
      class="address"
      @click.prevent.stop="copy"
      v-tooltip.top="address"
      id="address"
    >
      {{ shortBech32 }}
    </div>
    <div class="copied" :class="{ active: showSuccess }">
      <i class="material-icons">check</i><span>Copied</span>
    </div>
  </div>
</template>

<script>
import { clipboard } from "electron"
export default {
  name: `short-bech32`,
  props: {
    address: {
      type: String,
      required: true
    }
  },
  data: () => ({
    showSuccess: false
  }),
  computed: {
    shortBech32({ address } = this, length = 4) {
      if (!address) return `Address Not Found`
      if (address.indexOf(`1`) === -1) {
        return `Not A Valid Bech32 Address`
      } else {
        return address.split(`1`)[0] + `…` + address.slice(-1 * length)
      }
    }
  },
  methods: {
    copy() {
      clipboard.writeText(this.address)
      this.showSuccess = true
      setTimeout(() => {
        this.showSuccess = false
      }, 3000)
    }
  }
}
</script>
<style>
.short-bech32 {
  align-items: flex-start;
  display: flex;
  padding: 0;
  margin: 0;
}

.short-bech32 .address {
  color: var(--dim);
  cursor: pointer;
  font-size: 14px;
  line-height: 14px;
}

.short-bech32 .address:hover {
  color: var(--link);
}

.short-bech32 .copied {
  align-items: flex-end;
  display: flex;
  font-size: sm;
  opacity: 0;
  padding-left: 10px;
  transition: opacity 500ms ease;
  position: relative;
  top: -2px;
}

.short-bech32 .copied.active {
  opacity: 1;
}

.short-bech32 .copied i {
  color: var(--success);
  font-size: m;
  padding-bottom: 2px;
  padding-right: 0;
}
</style>
