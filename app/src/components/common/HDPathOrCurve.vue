<template>
  <span v-if="networkCryptoTypes.length > 1 && attempt > 0" class="algo">
    created using {{ currentCryptoView }}
  </span>
</template>
<script>
import { mapGetters } from "vuex"
export default {
  name: `hdpath-or-curve`,
  props: {
    attempt: {
      type: Number,
      required: true,
    },
    networkCryptoTypes: {
      type: Array,
      required: true,
    },
  },
  computed: {
    ...mapGetters([`currentNetwork`]),
    currentCryptoView() {
      if (this.currentNetwork.network_type === `cosmos`) {
        return JSON.parse(this.currentNetwork.HDPaths)[this.attempt].name
      } else if (this.currentNetwork.network_type === `polkadot`) {
        return JSON.parse(this.currentNetwork.curves)[this.attempt].name
      } else {
        return ``
      }
    },
  },
}
</script>
<style>
.algo {
  position: absolute;
  top: 0;
  left: 5.45rem;
  line-height: 2rem;
  padding: 0.75rem 0 0 0.15rem;
  font-size: 14px;
  color: var(--dim);
  font-weight: 600;
}
</style>
