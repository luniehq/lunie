<template>
  <div class="network-selector">
    <ul>
      <li
        v-for="network in mainnets"
        :key="network.chain_id"
        class="network-item"
        :class="{ selected: networkId === network.id }"
        @click="network.chain_id ? selectNetworkHandler(network) : false"
      >
        <img
          :src="`${network.icon}`"
          :alt="`logo for network ${network.title}`"
        />
        <div v-if="networkId === network.id" class="network-selected">
          <i class="material-icons notranslate">check</i>
        </div>
        <!-- {{ network.title }} -->
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
    ...mapGetters([`networks`]),
    ...mapGetters({ networkId: `network` }),
    mainnets() {
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
  position: relative;
}

.network-item:hover {
  opacity: 1;
  cursor: pointer;
}

.network-selected {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: var(--success);
  border-radius: 50%;
  height: 1rem;
  width: 1rem;
}

.network-selected i {
  font-size: 12px;
}

.selected {
  opacity: 1;
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
