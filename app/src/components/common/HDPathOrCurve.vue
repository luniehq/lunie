<template>
  <span v-if="networkCryptoTypes.length > 1 && attempt > 0" class="algo">
    {{ currentCryptoView }}
  </span>
</template>
<script>
const cryptoDictionary = {
  "m/44/118/0/0/0": `Cosmos HD Path`,
  "m/44/330/0/0/0": `Terra HD Path`,
  sr25519: `Schnorrkel curve`,
  ed25519: `Edwards curve`,
  ecdsa: `ECDSA curve`,
}

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
        return cryptoDictionary[
          JSON.parse(this.currentNetwork.HDPaths)[this.attempt].replace(
            /\'/g,
            ""
          )
        ]
      } else if (this.currentNetwork.network_type === `polkadot`) {
        return cryptoDictionary[
          JSON.parse(this.currentNetwork.curves)[this.attempt]
        ]
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
  padding: 0.75rem 0;
  font-size: var(--xs);
  color: var(--dim);
  text-transform: uppercase;
  font-weight: 600;
  border: 2px solid;
  border-radius: 0.25rem;
}
</style>
