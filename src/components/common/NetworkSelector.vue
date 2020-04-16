<template>
  <div class="network-selector">
    <ul>
      <li
        class="network-item"
        v-for="mainnet in mainnets"
        :key="mainnet.chain_id"
        @click="mainnet.chain_id ? selectNetworkHandler(mainnet) : false"
      >
        <img
          :src="`${mainnet.icon}`"
          :alt="`logo for network ${mainnet.title}`"
        />
        <!-- {{ mainnet.title }} -->
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  name: `network-selector`,
  data: () => ({}),
  computed: {
    ...mapGetters([`networks`, `network`]),
    mainnets: function() {
      return this.networks.filter(network => network.testnet === false)
    }
  },
  methods: {
    async selectNetworkHandler(network) {
      if (this.networkId !== network.id) {
        this.$store.dispatch(`setNetwork`, network)
      }
    }
  }
}
</script>

<style scoped>
.network-selector {
  position: fixed;
  height: 100%;
  overflow: auto;
  width: 4rem;
  padding: 1rem 0;
  margin: 0 auto;
  text-align: center;
  background: black;
  z-index: 1000;
}

.network-item {
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  font-weight: 400;
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s ease-in-out;
  opacity: 0.7;
}

.network-item:hover {
  opacity: 1;
  cursor: pointer;
}

img {
  max-height: 100%;
  height: 3rem;
  width: 3rem;
  display: block;
  border-radius: 50%;
  margin-bottom: 0.25rem;
}
</style>
